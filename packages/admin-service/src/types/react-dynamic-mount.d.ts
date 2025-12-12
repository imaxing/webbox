declare module "react-dynamic-mount" {
  import { ComponentType } from "react";

  interface DynamicMountOptions<T = any> {
    extend: ComponentType<T>;
  }

  interface DynamicMountResult {
    unmount: () => void;
    close: () => void;
  }

  function createDynamicMount<T = any>(
    options: DynamicMountOptions<T>
  ): (props: T) => DynamicMountResult;

  export default createDynamicMount;
}
