export const themes = [
  {
    key: 'public',
    title: '公共運動空間',
    desc: '市府營運收費親民，涵蓋北區、朝馬、南屯、長春、大里等國民運動中心，配備標準溫水泳池、體適能重訓室與綜合球場。',
    image:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80'
  },
  {
    key: 'single-entry',
    title: '單次入場免綁約空間',
    desc: '按分鐘或單次計費，無入會費與長約綁定壓力。如體育客、植健身，配備頂級深蹲架與自由重量區，自由隨到隨練。',
    image:
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&auto=format&fit=crop&q=80'
  },
  {
    key: 'chain',
    title: '大型連鎖健身房',
    desc: 'World Gym、健身工廠旗艦據點，全套進口頂級重訓機台、三溫暖 SPA 水療與豐富的 Les Mills 有氧團課無限上。',
    image:
      'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600&auto=format&fit=crop&q=80'
  },
  {
    key: 'smart24h',
    title: '24小時智能健身房',
    desc: '全年無休全天候開放，Anytime Fitness、Snap 等採用手機 App 與磁扣智慧門禁秒速通關，即時查詢在場人流。',
    image:
      'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=600&auto=format&fit=crop&q=80'
  }
]

export const locationData = {
  public: {
    title: '台中市公共運動空間（國民運動中心）',
    places: [
      { name: '北區國民運動中心', address: '台中市北區崇德路一段55號', tag: '溫水泳池 / 深水跳水池 / 體適能中心' },
      { name: '朝馬國民運動中心', address: '台中市西屯區朝貴路199號', tag: '專業羽球館 / 重訓健身房' },
      { name: '南屯國民運動中心', address: '台中市南屯區黎明路一段998號', tag: '室內綜合球場 / 飛輪教室' },
      { name: '長春國民暨兒童運動中心', address: '台中市南區合作街46號', tag: '兒童專屬運動區 / 綜合健身' },
      { name: '大里國民暨兒童運動中心', address: '台中市大里區國光路一段258號', tag: '室內排球場 / 溫水水療 SPA' }
    ]
  },
  'single-entry': {
    title: '台中市單次入場免綁約空間',
    places: [
      { name: '體育客 1st Fitness (台中自由店)', address: '台中市中區自由路二段8號B1', tag: '分鐘計費 1.1元/分・免綁年約' },
      { name: '植健身 Plant Fitness', address: '台中市西區公益路155巷9號B1', tag: '單次進場暢練・頂級重訓設備' },
      { name: '怪獸訓練 基地 (台中)', address: '台中市西區民權路229巷11號', tag: '肌力體能訓練・計次收費' },
      { name: 'FitBox 運動空間 (台中崇德店)', address: '台中市北屯區崇德路二段218號', tag: '無合約限制・單次票券自由進出' }
    ]
  },
  chain: {
    title: '台中市大型連鎖健身房',
    places: [
      { name: 'World Gym 台中美村店 (Sport旗艦館)', address: '台中市西區美村路一段22號', tag: 'SPA水療池 / Les Mills有氧團課 / 免費毛巾' },
      { name: '健身工廠 Fitness Factory (台中精華廠)', address: '台中市南屯區大墩十一街386號', tag: '國際認證進口機台 / 完善體適能設施' },
      { name: 'World Gym 台中崇德店', address: '台中市北屯區崇德路二段16號', tag: '多功能草皮訓練區 / 恆溫室內泳池' }
    ]
  },
  smart24h: {
    title: '台中市24小時智能健身房',
    places: [
      { name: 'Anytime Fitness (台中公益旗艦店)', address: '台中市西區公益路161號B1', tag: '24小時全天無休・APP藍牙通關・全球分店通用' },
      { name: 'Snap Fitness 24/7 (台中崇德店)', address: '台中市北屯區崇德路二段218號', tag: '24小時營業・無壓力智慧門禁' },
      { name: 'Anytime Fitness (台中逢甲店)', address: '台中市西屯區福星路328號', tag: '24H開放・深夜晨間自主訓練首選' }
    ]
  }
}

export function mapsUrl(place) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    place.name + ' ' + place.address
  )}`
}
