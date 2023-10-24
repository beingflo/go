import { Component, createEffect, createSignal, onMount, Show } from "solid-js";
import { useStore } from "./store";

const Import: Component = () => {
  const [state, { setS3Config }] = useStore();
  const [content, setContent] = createSignal("");
  let ref;

  onMount(() => {
    ref.addEventListener("change", () => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setContent(JSON.parse(evt.target.result as string));
      };
      reader.readAsText(ref.files[0]);
    });
  });

  createEffect(() => console.log(content()));

  return (
    <div class="flex flex-col w-full p-2 md:p-4">
      <div class="w-full max-w-8xl mx-auto">
        <label
          class="px-4 rounded-sm bg-white border border-black py-2 uppercase text-black hover:bg-gray-100 hover:shadow-none focus:outline-none hover:cursor-pointer"
          for="file"
        >
          Select json file
        </label>
        <input ref={ref} type="file" id="file" class="hidden" />
      </div>
    </div>
  );
};

export default Import;
