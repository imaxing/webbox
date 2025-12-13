export interface MenuItem {
  name: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
  pro?: boolean;
  new?: boolean;
}

export interface MenuPayload {
  items: MenuItem[];
}
