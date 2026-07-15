interface MutableAnimationValue {
  value: number;
}

export function resetCalibrationAreaPreviewAnimation(
  progress: MutableAnimationValue,
  originX: MutableAnimationValue,
  originY: MutableAnimationValue,
) {
  progress.value = 0;
  originX.value = 0;
  originY.value = 0;
}
