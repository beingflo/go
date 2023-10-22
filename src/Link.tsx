import { Component } from "solid-js";

export type LinkProps = {
  id: string;
  url: string;
  description: string;
  lastAccessedAt: string;
  numAccessed: number;
  selected?: boolean;
};

const Link: Component<LinkProps> = (props: LinkProps) => {
  return (
    <div class="w-full grid grid-cols-12 group gap-2">
      <div class="flex flex-row gap-2 text-sm font-light col-span-12 md:col-span-6 underline-offset-4">
        <a href={props.url} class={props.selected ? "underline" : ""}>
          {props.url}
        </a>
        <div class="hidden group-hover:flex text-sm font-light flex-row gap-2">
          <div class="hover:cursor-pointer">del</div>
        </div>
      </div>
      <p class="hidden md:block text-sm font-light text-left col-span-4">
        {props.description}
      </p>
      <p class="hidden md:block text-sm font-light text-right col-span-1">
        {props.lastAccessedAt}
      </p>
      <p class="hidden md:block text-sm font-light text-right col-span-1">
        {props.numAccessed}
      </p>
    </div>
  );
};

export default Link;
