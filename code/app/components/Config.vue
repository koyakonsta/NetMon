
<template>
  <Page>
    <ActionBar>
      <Label text="Devices" class="font-bold text-lg"/>
      <NavigationButton text="Back" android.systemIcon="ic_menu_back" @tap="$navigateBack()"/>
    </ActionBar>

    <StackLayout>
      <Label text="These devices are currently connected to your network:" />
      <ListView :items="devices" class="list">
        <v-template v-slot="{ item }">
          <GridLayout columns="*, auto" padding="12px">
            <Label :text="item.name" :class="item.safe ? 'safe' : 'unsafe'" class="device-item" col="0" />
            <Button :text="'Mark ' + (item.safe ? 'Unsafe' : 'Safe')" col="1" @tap="toggleSafe(item)"></Button>
          </GridLayout>
        </v-template>
      </ListView>
    </StackLayout>
  </Page>
</template>


<script lang="ts">
  import Vue from "nativescript-vue";
  import {globalState} from "~/store";

  export default Vue.extend({
    computed: {
      devices(){
        return globalState.devices;
      }
    },

    methods: {
      toggleSafe(device: { name: string, safe: boolean }) {
        device.safe = !device.safe;
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
