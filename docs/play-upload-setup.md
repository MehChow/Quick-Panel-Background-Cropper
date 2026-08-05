# Google Play Upload Automation Setup

One-time setup for uploading the locally built QPBC `.aab` to Google Play
Internal testing from macOS or Windows.

The recurring release command uses the pinned Fastlane lane after the local AAB
has passed its build, signing, and certificate checks.

## What the automation uses

- the existing local Expo/Gradle AAB build;
- Ruby 3.3 or newer;
- Bundler;
- repository-pinned Fastlane `2.237.0`; and
- a Google Play service-account JSON key.

It does not use EAS Build, EAS Submit, or EAS Workflows.

The Play service-account key is separate from:

- `credentials.json`, which describes the Android upload keystore; and
- `credentials/android/keystore.jks`, which signs the AAB.

## Install Ruby and Bundler on macOS

Fastlane supports Ruby 3.0 or newer and prefers Ruby 3.3 or newer. Do not use
the old macOS system Ruby.

One Homebrew setup is:

```bash
brew install ruby
echo 'export PATH="$(brew --prefix ruby)/bin:$PATH"' >> ~/.zshrc
exec zsh
ruby --version
gem install bundler
bundle --version
```

Expected: Ruby reports `3.3` or newer and Bundler prints its version.

## Install Ruby and Bundler on Windows

1. Install a current Ruby+Devkit `3.3` or newer from
   [RubyInstaller for Windows](https://rubyinstaller.org/).
2. Allow the installer to install the MSYS2 development toolchain.
3. Open a new PowerShell window.
4. Run:

```powershell
ruby --version
gem install bundler
bundle --version
```

Expected: Ruby reports `3.3` or newer and Bundler prints its version.

## Install the repository-pinned Fastlane

Run this on every release machine after cloning or updating the repository:

```bash
bundle install
bundle check
bundle exec fastlane lanes
```

Expected: dependencies are satisfied and Fastlane lists
`android upload_internal`.

Always use `bundle exec fastlane`. Do not rely on a separately installed global
Fastlane version.

## Create the Google Play service account

This setup is performed once for the developer account:

1. Create or select a Google Cloud project.
2. Enable the Google Play Android Developer API.
3. Create a service account.
4. Open Play Console -> Users and permissions.
5. Invite the service-account email.
6. Give it access only to Quick Panel Background Cropper.
7. Grant:
   - View app information (read-only); and
   - Release apps to testing tracks.
8. Do not grant Release to production.

Create one JSON key for each physical release machine. Separate keys let you
revoke one lost or replaced machine without rotating every machine.

Primary setup reference:
[Google Play Developer API](https://developers.google.com/android-publisher/getting_started).

## Store the key outside the repository

Recommended locations:

- macOS: `~/.config/qpbc/google-play-service-account.json`
- Windows: `%USERPROFILE%\.config\qpbc\google-play-service-account.json`

Never place the key inside this repository, commit it, paste it into a tracked
configuration file, or send it between machines through Git.

On macOS, protect the copied key:

```bash
mkdir -p ~/.config/qpbc
chmod 600 ~/.config/qpbc/google-play-service-account.json
```

## Configure the key path on macOS

Add this to `~/.zshrc`:

```bash
export QPBC_PLAY_SERVICE_ACCOUNT_JSON="$HOME/.config/qpbc/google-play-service-account.json"
```

Open a new Terminal window, then check only that the path exists:

```bash
test -f "$QPBC_PLAY_SERVICE_ACCOUNT_JSON" && echo "Play key path ready"
```

Do not print the key file.

## Configure the key path on Windows

Run in PowerShell after copying the key to the recommended location:

```powershell
[Environment]::SetEnvironmentVariable(
  "QPBC_PLAY_SERVICE_ACCOUNT_JSON",
  "$env:USERPROFILE\.config\qpbc\google-play-service-account.json",
  "User"
)
```

Open a new PowerShell window, then check only that the path exists:

```powershell
Test-Path $env:QPBC_PLAY_SERVICE_ACCOUNT_JSON
```

Expected: `True`. Do not print the key file.

## Validate Play access

Validate the key without uploading an AAB:

macOS/zsh:

```bash
bundle exec fastlane run validate_play_store_json_key \
  json_key:"$QPBC_PLAY_SERVICE_ACCOUNT_JSON"
```

Windows PowerShell:

```powershell
bundle exec fastlane run validate_play_store_json_key `
  json_key:"$env:QPBC_PLAY_SERVICE_ACCOUNT_JSON"
```

If validation fails, check:

- Google Play Android Developer API is enabled;
- the service-account email is invited in Play Console;
- the invitation has access to this app;
- Release apps to testing tracks is granted; and
- the machine points to the correct JSON key.

Permission changes can take time to propagate.

## Before every release

Use the recurring checklist in `docs/dev-release-flow.md`. In particular,
review and commit `docs/release-notes/play-en-US.txt` before running
`npm run build-release`.
