// ボタンレイアウトとJSONファイルの対応関係を定義
export const buttonLayouts = [
  { name: 'default', jsonFile: './default-buttons.json', label: 'Default' },
  { name: 'pws-type-b', jsonFile: './pws-type-b.json', label: 'PWS Type B' },
  { name: 'pws-type-c', jsonFile: './pws-type-c.json', label: 'PWS Type C' },
  { name: 'pws-type-d', jsonFile: './pws-type-d.json', label: 'PWS Type D' },
  { name: 'pws-type-f', jsonFile: './pws-type-f.json', label: 'PWS Type F' },
  { name: 'hori-nolva', jsonFile: './hori-nolva.json', label: 'HORI Nolva' }
]

// レイアウトの名前からJSONファイルパスを取得する関数
export const getJsonFilePath = (layoutName) => {
  const layout = buttonLayouts.find(l => l.name === layoutName)
  return layout ? layout.jsonFile : null
}

// レイアウトの名前から表示ラベルを取得する関数
export const getLayoutLabel = (layoutName) => {
  const layout = buttonLayouts.find(l => l.name === layoutName)
  return layout ? layout.label : layoutName
}
