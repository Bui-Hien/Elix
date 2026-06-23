export const BeadCalculator = {
  calculateTotalPrice: (beads: any[]) => {
    return beads.reduce((total, bead) => {
      // Ensure price is a number
      const price = parseFloat(bead.price) || 0;
      return total + price;
    }, 0);
  },

  calculateWristSize: (beads: any[]) => {
    if (beads.length === 0) return { value: 0, status: 'empty' as const };
    
    // Simple increment based on bead size:
    const getIncrement = (sizeMm: number) => {
      if (sizeMm === 0) return 0;
      if (sizeMm <= 6) return 0.5;
      if (sizeMm <= 8) return 0.73;
      if (sizeMm <= 10) return 0.89;
      if (sizeMm <= 11) return 1.04;
      return 1.04;
    };
    
    let innerDiameterCm = 0;
    beads.forEach(bead => {
      innerDiameterCm += getIncrement(bead.sizeMm || 8);
    });
    
    const MIN_DIAMETER = 13;
    const MAX_DIAMETER = 27;
    
    let status: 'normal' | 'too_short' | 'too_long' = 'normal';
    if (innerDiameterCm < MIN_DIAMETER) {
      status = 'too_short';
    } else if (innerDiameterCm > MAX_DIAMETER) {
      status = 'too_long';
    }
    
    return {
      value: parseFloat(innerDiameterCm.toFixed(1)),
      status,
      min: MIN_DIAMETER,
      max: MAX_DIAMETER
    };
  },

  getLogoColor: (beads: any[]) => {
    if (!beads || beads.length === 0) return '#e5e7eb'; // Default gray-200

    const uniqueMaterials = Array.from(new Set(beads.map(b => b.materialId)));
    
    if (uniqueMaterials.length === 1) {
      const colorMap: Record<string, string> = {
        'white_crystal': '#a0a0a0', // Visible gray for white
        'amethyst': '#9f7aea',
        'citrine': '#d69e2e',
        'rose_quartz': '#f687b3',
        'smoky_quartz': '#8d6e63'
      };
      return colorMap[uniqueMaterials[0] as string] || '#9ca3af';
    } else {
      return 'linear-gradient(to right, #fbc2eb, #a6c1ee)'; 
    }
  },

  calculateBeadScale: (beadCount: number) => {
    if (beadCount < 15) return 1.2;
    if (beadCount > 30) return 0.8;
    if (beadCount > 22) return 0.9;
    return 1.0;
  }
};

export const BEAD_CATEGORIES = [
  {
    id: 'white_crystal',
    name: 'Thạch Anh Trắng',
    nameEn: 'White Crystal',
    subTypes: ['净体白水晶', '奶白晶', '喜马拉雅水晶', '婚纱闪白阿塞水晶', '刻面方糖水晶']
  },
  {
    id: 'amethyst',
    name: 'Thạch Anh Tím',
    nameEn: 'Amethyst',
    subTypes: ['巴西紫水晶', '薰衣草紫水晶', '乌拉圭紫水晶']
  },
  {
    id: 'citrine',
    name: 'Thạch Anh Vàng',
    nameEn: 'Citrine',
    subTypes: ['暴力黄黄水晶', '透体柠檬黄黄水晶', '黄塔晶']
  },
  {
    id: 'rose_quartz',
    name: 'Thạch Anh Hồng',
    nameEn: 'Rose Quartz',
    subTypes: ['紫粉水晶', '蜜桃粉水晶', '星光粉水晶']
  },
  {
    id: 'smoky_quartz',
    name: 'Thạch Anh Khói',
    nameEn: 'Smoky Quartz',
    subTypes: ['净体茶水晶']
  },
  {
    id: 'phantom_crystal',
    name: 'Thạch Anh Ưu Linh',
    nameEn: 'Phantom Crystal',
    subTypes: ['暴风雪雪花水晶', '满天星绿幽灵水晶', '紫幽灵水晶']
  },
  {
    id: 'rutilated_quartz',
    name: 'Tóc Vàng/Đen',
    nameEn: 'Rutilated Quartz',
    subTypes: ['绿发晶', '金发晶', '黑发晶', '黑金超']
  },
  {
    id: 'rabbit_hair_crystal',
    name: 'Thạch Anh Lông Thỏ',
    nameEn: 'Rabbit Hair Crystal',
    subTypes: ['红兔毛', '绿兔毛']
  },
  {
    id: 'flower_crystal',
    name: 'Thạch Anh Hoa',
    nameEn: 'Flower Crystal',
    subTypes: ['红胶花', '黄胶花']
  },
  {
    id: 'aquamarine',
    name: 'Aquamarine',
    nameEn: 'Aquamarine',
    subTypes: ['冰川蓝', '魔鬼蓝', '蓝天白云']
  },
  {
    id: 'strawberry_crystal',
    name: 'Thạch Anh Dâu',
    nameEn: 'Strawberry Crystal',
    subTypes: ['豆沙红', '鸽血红']
  },
  {
    id: 'fluorite',
    name: 'Fluorite',
    nameEn: 'Fluorite',
    subTypes: ['绿萤石']
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    nameEn: 'Obsidian',
    subTypes: ['金曜石', '银曜石', '黑曜石', '银曜石桃心']
  },
  {
    id: 'prehnite',
    name: 'Prehnite',
    nameEn: 'Prehnite',
    subTypes: ['绿葡萄', '金葡萄']
  },
  {
    id: 'amazonite',
    name: 'Amazonite',
    nameEn: 'Amazonite',
    subTypes: ['天河石']
  },
  {
    id: 'tiger_eye',
    name: 'Mắt Hổ',
    nameEn: 'Tiger Eye',
    subTypes: ['蓝虎眼', '金虎眼', '黄虎眼', '黄虎眼立方']
  },
  {
    id: 'sunstone',
    name: 'Đá Mặt Trời',
    nameEn: 'Sunstone',
    subTypes: ['太阳石', '金太阳']
  },
  {
    id: 'moonstone',
    name: 'Đá Mặt Trăng',
    nameEn: 'Moonstone',
    subTypes: ['灰月光', '蓝月光']
  },
  {
    id: 'rhodonite',
    name: 'Đá Hoa Hồng',
    nameEn: 'Rhodonite',
    subTypes: ['樱花雨', '玫瑰粉']
  },
  {
    id: 'agate',
    name: 'Mã Não',
    nameEn: 'Agate',
    subTypes: ['白玉髓', '红玛瑙', '绿玛瑙', '蓝纹玛瑙', '黄玛瑙']
  },
  {
    id: 'cinnabar',
    name: 'Chu Sa',
    nameEn: 'Cinnabar',
    subTypes: ['帝王砂', '紫金砂']
  },
  {
    id: 'spacer',
    name: 'Hạt Cách',
    nameEn: 'Spacer Beads',
    subTypes: []
  },
  {
    id: 'pendant',
    name: 'Mặt Dây',
    nameEn: 'Pendants',
    subTypes: []
  },
  {
    id: 'other',
    name: 'Khác',
    nameEn: 'Other',
    subTypes: ['孔雀石', '海纹石', '石榴石', '紫锂辉', '红纹石', '绿龙晶', '蓝晶石', '青金石', '黑碧玺']
  },
  {
    id: 'special_shape',
    name: 'Hình dạng đặc biệt',
    nameEn: 'Special Shape',
    subTypes: []
  }
];

export const getCategoryById = (id: string) => {
  return BEAD_CATEGORIES.find(cat => cat.id === id);
};

export const getCategoryName = (id: string, language = 'vi') => {
  const category = getCategoryById(id);
  if (!category) return id;
  return language === 'vi' ? category.name : category.nameEn;
};
