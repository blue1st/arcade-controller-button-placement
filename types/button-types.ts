// ボタンの型定義
export type Button = {
  id: number;
  x: number;
  y: number;
  label: string;
  diameter: number;
}

// コントローラー機種の型定義
export type ControllerType = {
  id: string;
  name: string;
  description: string;
}

// レイアウト設定の型定義
export type LayoutConfig = {
  name: string;
  label: string;
  jsonFile: string;
}
