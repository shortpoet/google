const recase = (field) => {
  // make sure to leave quotes off regex
  let regex = new RegExp(/([A-Z][a-z])/g)
  let replacement = ' $1'
  let transformation = field.replace(regex, replacement).replace(new RegExp(/^./), s => s.toUpperCase())
  return transformation
}

export default recase
