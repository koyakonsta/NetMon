
<template>
  <Page>
    <ActionBar>
      <Label text="Config" class="font-bold text-lg"/>
      <NavigationButton text="Back" android.systemIcon="ic_menu_back" @tap="$navigateBack()"/>
    </ActionBar>

    <StackLayout>
      <Label text="Configure settings:" />
      <ListPicker :items="globalState.networkInterfaces" @selectedIndexChange="setIf" />
      <Label :text="'Selected interface: ' + globalState.selectedInterface" />
    </StackLayout>
  </Page>
</template>


<script lang="ts">
  import Vue from "nativescript-vue";
  import {globalState} from "~/store";

  export default Vue.extend({
    computed: {
      globalState() {
        return globalState
      },
    },

    methods: {
      setIf(args){
        const picker = args.object;
        const indx = picker.selectedIndex;
        globalState.selectedInterface = globalState.networkInterfaces[indx];
      }
    }
  });
</script>

<style>
.list {
  height: 100%
}

.device-item {
  font-size: 16px;
  padding: 12px;
}

.safe {
  color: green;
}
.unsafe {
  color: red;
}

Button {
  margin-left: 8px;
}
</style>
