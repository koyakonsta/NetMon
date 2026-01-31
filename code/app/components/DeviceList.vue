
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

  export default Vue.extend({
    data() {
      return {
        devices: [
          {"name":'8a:3b:85:ef:4b:1b', "safe": true},
          {"name":'97:d4:b3:b3:21:f6', "safe": false},
          {"name":'af:50:59:70:f4:f1', "safe": true},
          {"name":'4c:ae:b2:16:24:a8', "safe": false},
          {"name":'d8:f4:29:61:04:dc', "safe": true},
        ]
      }
    },

    computed: {},

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
