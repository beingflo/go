import { Component } from "solid-js";

export type LinkProps = {
  title: string;
  url: string;
  createdAt: string;
  lastAccessedAt: string;
  numAccessed: number;
  selected: boolean;
};

const Link: Component<LinkProps> = (props: LinkProps) => {
  return (
    <div class="w-full grid grid-cols-12">
      <div
        class={`text-sm font-light col-span-12 md:col-span-6 underline-offset-4 ${
          props.selected ? "underline" : ""
        }`}
      >
        {props.url}
      </div>
      <p class="hidden md:block text-sm text-right col-span-2">
        {props.createdAt}
      </p>
      <p class="hidden md:block text-sm text-right col-span-2">
        {props.lastAccessedAt}
      </p>
      <p class="hidden md:block text-sm text-right col-span-2">
        {props.numAccessed}
      </p>
    </div>
  );
};

export default Link;
