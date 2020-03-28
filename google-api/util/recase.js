const recase = (field) => {
  // make sure to leave quotes off regex
  // console.log(field)
  let regex = new RegExp(/([A-Z][a-z])/g)
  let replacement = ' $1'
  let transformation = field.replace(regex, replacement).replace('/^./', s => s.toUpperCase())
  // console.log(transformation)
  return transformation
}

module.exports = recase;
