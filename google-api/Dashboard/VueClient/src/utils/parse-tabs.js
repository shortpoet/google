const parseTabs = function (tabs) {
  if (tabs.includes(',')) {
    return tabs.split(',').map(x => x.replace(/\s+/g, ''))
  } else {
    var _tabs = []
    _tabs.push(tabs)
    return _tabs
  }
}

export default parseTabs
