const tryOrNull = (fn) => {
  try {
    return fn()
  } catch (_) {
    return null
  }
}

export default tryOrNull
