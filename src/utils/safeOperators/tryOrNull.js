const tryOrNull = (fn) => {
  try {
    fn()
  } catch (_) {
    return null
  }
}

export default tryOrNull
