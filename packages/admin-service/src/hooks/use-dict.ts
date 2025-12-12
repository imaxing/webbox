import { useState, useEffect } from "react";

interface DictOption {
  value: string;
  label: string;
  description?: string;
}

interface DictData {
  projects: DictOption[];
  userRole: DictOption[];
  userStatus: DictOption[];
  domainStatus: DictOption[];
  routeType: DictOption[];
  templateCategory: DictOption[];
  templateStatus: DictOption[];
  variableType: DictOption[];
}

// 创建一个 Map 对象，用于快速查找
type DictMap = Record<string, string>;

let cachedDict: DictData | null = null;

/**
 * 字典数据 Hook
 * 从 dict.json 加载所有字典数据
 */
export function useDict() {
  const [dict, setDict] = useState<DictData | null>(cachedDict);
  const [loading, setLoading] = useState(!cachedDict);

  useEffect(() => {
    if (cachedDict) {
      setDict(cachedDict);
      return;
    }

    const loadDict = async () => {
      setLoading(true);
      try {
        const response = await fetch("/json/dict.json");
        const data = await response.json();
        cachedDict = data;
        setDict(data);
      } catch (error) {
        console.error("加载字典数据失败:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDict();
  }, []);

  // 生成 Map 对象（value -> label）
  const createMap = (options: DictOption[]): DictMap => {
    return options.reduce((acc, item) => {
      acc[item.value] = item.label;
      return acc;
    }, {} as DictMap);
  };

  const dicts = {
    loading,
    // 选项数组（用于 Select）
    options: {
      projects: dict?.projects || [],
      userRole: dict?.userRole || [],
      userStatus: dict?.userStatus || [],
      domainStatus: dict?.domainStatus || [],
      routeType: dict?.routeType || [],
      templateCategory: dict?.templateCategory || [],
      templateStatus: dict?.templateStatus || [],
      variableType: dict?.variableType || [],
    },
    // Map 对象（用于显示映射）
    map: {
      userRole: dict ? createMap(dict.userRole) : {},
      userStatus: dict ? createMap(dict.userStatus) : {},
      domainStatus: dict ? createMap(dict.domainStatus) : {},
      routeType: dict ? createMap(dict.routeType) : {},
      templateCategory: dict ? createMap(dict.templateCategory) : {},
      templateStatus: dict ? createMap(dict.templateStatus) : {},
      variableType: dict ? createMap(dict.variableType) : {},
    },
  };

  return dicts;
}
