// ボタンレイアウトとJSONファイルの対応関係を定義
export const buttonLayouts = [
  { name: 'default', jsonFile: './default-buttons.json', label: 'Default', amazonLink: 'https://link.amazon/B0ail1XtV' },
  { name: 'basic-lever', jsonFile: './basic-lever.json', label: 'Basic Lever', amazonLink: 'https://link.amazon/B0bBBRgkw', hasLever: true },
  { name: 'pws-type-b', jsonFile: './pws-type-b.json', label: 'PWS Type B' },
  { name: 'pws-type-c', jsonFile: './pws-type-c.json', label: 'PWS Type C' },
  { name: 'pws-type-d', jsonFile: './pws-type-d.json', label: 'PWS Type D / VAMILO FK2' },
  { name: 'pws-type-e', jsonFile: './pws-type-e.json', label: 'PWS Type E' },
  { name: 'pws-type-f', jsonFile: './pws-type-f.json', label: 'PWS Type F' },
  { name: 'hori-nolva', jsonFile: './hori-nolva.json', label: 'HORI Nolva', amazonLink: 'https://link.amazon/B0232r285' },
  { name: 'rushbox', jsonFile: './rushbox-layout.json', label: 'Rushbox', amazonLink: 'https://link.amazon/B0fYQxgbk' },
  { name: 'haute46-16series', jsonFile: './haute46-16series.json', label: 'Haute46 16Series', amazonLink: 'https://link.amazon/B0amz5dbJ' },
  { name: 'pws-fs30', jsonFile: './pws-fs30.json', label: 'PWS FS-30', hasLever: true },
  { name: 'pws-fs24', jsonFile: './pws-fs24.json', label: 'PWS FS-24', hasLever: true },
  { name: 'm-gaming-a01', jsonFile: './m-gaming-a01.json', label: 'M-GAMING A01', amazonLink: 'https://link.amazon/B08M7chw0', hasLever: true },
  { name: 'vamilo-kassai', jsonFile: './vamilo-kassai.json', label: 'VAMILO KASSAI', hasLever: true },
  { name: 'brook-starburst', jsonFile: './brook-starburst.json', label: 'Brook Starburst', amazonLink: 'https://link.amazon/B043ApLTW' },
  { name: 'madcatz-neko', jsonFile: './madcatz-neko.json', label: 'MadCatz N.E.K.O', amazonLink: 'https://link.amazon/B0a9Vwv1z' },
  { name: 'victrix-pro-ko', jsonFile: './victrix-pro-ko.json', label: 'Victrix Pro KO', amazonLink: 'https://link.amazon/B0jbsRCUE' },
  { name: 'quanba-sapphire', jsonFile: './quanba-sapphire.json', label: 'Quanba Sapphire', amazonLink: 'https://link.amazon/B0ih24uPa' }
] as const

// レイアウトの名前からJSONファイルパスを取得する関数
export const getJsonFilePath = (layoutName: string): string | null => {
  const layout = buttonLayouts.find(l => l.name === layoutName)
  return layout ? layout.jsonFile : null
}

// レイアウトの名前から表示ラベルを取得する関数
export const getLayoutLabel = (layoutName: string): string => {
  const layout = buttonLayouts.find(l => l.name === layoutName)
  return layout ? layout.label : layoutName
}
