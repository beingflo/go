import { Component } from "solid-js";
import Logo from "../src/line.svg";

const Help: Component = () => {
  const Instruction = (props) => {
    return (
      <div class="flex flex-row justify-between mb-4">
        <p class="font-bold">{props.left}</p>
        <p class="italic">{props.right}</p>
      </div>
    );
  };

  return (
    <div class="max-w-2xl mt-4 md:mt-12 mx-auto px-4">
      <div class="flex flex-row gap-4 items-center">
        <Logo class="w-12 h-12" />
        <h1 class="text-2xl font-bold tracking-tight">go</h1>
      </div>
      <p class="mt-4">A tiny, opinionated link aggregation application.</p>
      <p class="mt-4 mb-10">
        You're already in the application, press <b>h</b> to toggle the help
        screen!
      </p>
      <Instruction left="h" right="Toggle help screen" />
      <Instruction left="c" right="Toggle configuration screen" />
      <h2 class="text-xl font-semibold mt-12">S3 synchronization and backup</h2>
      <p class="mt-4 pb-10">
        In the configuration of this app, you can add an endpoint and
        credentials for an S3 provider. If this is provided, the application
        will synchronize the local state with the S3 bucket when gaining or
        losing focus.
      </p>
    </div>
  );
};

export default Help;
