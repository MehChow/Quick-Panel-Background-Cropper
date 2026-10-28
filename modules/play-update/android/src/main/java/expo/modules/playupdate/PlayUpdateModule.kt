package expo.modules.playupdate

import android.app.Activity
import com.google.android.play.core.appupdate.AppUpdateManager
import com.google.android.play.core.appupdate.AppUpdateManagerFactory
import com.google.android.play.core.install.InstallStateUpdatedListener
import com.google.android.play.core.install.model.AppUpdateType
import com.google.android.play.core.install.model.InstallStatus
import com.google.android.play.core.install.model.UpdateAvailability
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class PlayUpdateModule : Module() {
  private var manager: AppUpdateManager? = null
  private var flowPromise: Promise? = null
  private val requestCode = 17451
  private val listener = InstallStateUpdatedListener { state ->
    sendEvent("onUpdateState", mapOf(
      "status" to state.installStatus(),
      "bytesDownloaded" to state.bytesDownloaded().toDouble(),
      "totalBytes" to state.totalBytesToDownload().toDouble()
    ))
  }

  override fun definition() = ModuleDefinition {
    Name("PlayUpdate")
    Events("onUpdateState")

    OnCreate {
      appContext.reactContext?.let {
        manager = AppUpdateManagerFactory.create(it)
        manager?.registerListener(listener)
      }
    }
    OnDestroy {
      manager?.unregisterListener(listener)
      flowPromise?.resolve("failed")
      flowPromise = null
    }
    OnActivityResult { _, result ->
      if (result.requestCode == requestCode) {
        flowPromise?.resolve(if (result.resultCode == Activity.RESULT_OK) "accepted" else if (result.resultCode == Activity.RESULT_CANCELED) "declined" else "failed")
        flowPromise = null
      }
    }
    AsyncFunction("check") { promise: Promise ->
      val updateManager = manager
      if (updateManager == null) {
        promise.resolve(null)
      } else {
        updateManager.appUpdateInfo.addOnSuccessListener { info ->
          promise.resolve(mapOf(
            "available" to (info.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE && info.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE)),
            "versionCode" to info.availableVersionCode(),
            "status" to info.installStatus()
          ))
        }.addOnFailureListener { promise.resolve(null) }
      }
    }
    AsyncFunction("start") { promise: Promise ->
      val updateManager = manager
      val activity = appContext.currentActivity
      if (updateManager == null || activity == null || flowPromise != null) {
        promise.resolve("failed")
      } else {
        updateManager.appUpdateInfo.addOnSuccessListener { info ->
          try {
            flowPromise = promise
            if (!updateManager.startUpdateFlowForResult(info, AppUpdateType.FLEXIBLE, activity, requestCode)) {
              flowPromise = null
              promise.resolve("failed")
            }
          } catch (_: Exception) {
            flowPromise = null
            promise.resolve("failed")
          }
        }.addOnFailureListener { promise.resolve("failed") }
      }
    }
    AsyncFunction("complete") { promise: Promise ->
      val updateManager = manager
      if (updateManager == null) promise.resolve(false)
      else updateManager.completeUpdate().addOnSuccessListener { promise.resolve(true) }
        .addOnFailureListener { promise.resolve(false) }
    }
  }
}
