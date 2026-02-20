<template>
  <Page>
    <ActionBar>
      <Label text="Threat Log" class="font-bold text-lg"/>
      <NavigationButton text="Back" android.systemIcon="ic_menu_back" @tap="$navigateBack()"/>
    </ActionBar>

    <GridLayout columns="auto" rows="auto, *, auto">
      <Label row="0" text="This is the contents of the threat log file, containing all past incidents." textWrap="true" width="100%"/>
      <TextView row="1" class="log" editable="false" :text="fileContents" textWrap="true" width="100%"/>
      <GridLayout row="2" columns="*, *" rows="auto" width="100%">
        <Button col="0" text="Refresh" @tap="reload"/>
        <Button col="1" text="Clear contents" @tap="clearHistory"/>
      </GridLayout>
    </GridLayout>
  </Page>
</template>

<script lang="ts">
  import Vue from "nativescript-vue";
  import {File, Utils} from "@nativescript/core";
  import {globalState} from "~/store";

  const context = Utils.ad.getApplicationContext();
  const filesDir = context.getFilesDir().getAbsolutePath();
  const filename = `${filesDir}/threats.log`;

  function readLog() {
    const file = File.fromPath(filename);
    const contents = file.readTextSync((err: any) => {
      if (err) {
        console.error(err);
      }
    }, "utf-8");
    if (!contents) {
      return "The log file is empty!";
    }
    return contents;
  }

  export default Vue.extend({
    computed: {
      fileContents() {
        return globalState.threatLogContents;
      }
    },

    methods: {
      reload() {
        globalState.threatLogContents = readLog();
      },

      clearHistory() {
        const file = File.fromPath(filename);
        file.writeTextSync("", (err: any) => { if (err) { console.error(err); } }, "utf-8");
        globalState.threatLogContents = readLog();
      },
    },

    mounted() {
      globalState.threatLogContents = readLog();
    }
  });
</script>

<style>
.log {
  font-size: 11px;
  font-family: Consolas, monospace;
  background-color: lightgrey;
  border: 1px solid white;
}
</style>
