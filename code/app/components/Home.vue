<template>
  <Page>
    <ActionBar>
      <Label text="Home" class="font-bold text-lg"/>
      <ActionItem text="Config" android.position="actionBar" @tap="goToConfig"/>
    </ActionBar>

    <StackLayout>
      <Button text="Scan Network" col="1" @tap="scanDevices"></Button>
      <ListView :items="scanlist" class="list">
        <v-template v-slot="{ item }">
          <GridLayout columns="*,*" rows="auto,auto,auto">
            <Label row="0" col="0" textWrap="true" :text="'Status: '+item.status.state" :class="getClass(item)"/>
            <Label row="0" col="1" textWrap="true" :text="'Address: '+addrs2list(item.address)" :class="getClass(item)"/>
            <Label row="1" col="0" textWrap="true" :text="'Hostname: '+hosts2list(item.hostnames)" :class="getClass(item)"/>
            <Label row="1" col="1" textWrap="true" :text="'Vendor: '+item.vendor" :class="getClass(item)"/>
            <Label row="2" col="0" textWrap="true" :text="'Risk score: '+item.riskScore" :class="getClass(item)"/>
            <Button row="2" col="1" :text="getButtonText(item)" @tap="toggleSafe(item)" :class="getButtonClass(item)"/>
          </GridLayout>
        </v-template>
      </ListView>
    </StackLayout>
  </Page>
</template>

<script lang="ts">
  import Vue from "nativescript-vue";
  import Config from "@/components/Config.vue";
  import {globalState} from "~/store";
  import * as netutils from "~/netutils";
  import {NmapAddress, NmapHost} from "~/netutils";
  const nmpw = new Worker('~/nmapworker.ts');
  const tcpw = new Worker('~/tcpworker.ts');
  tcpw.onerror = (err) => {
    console.log("Worker crashed:", err.message);
    console.log("Filename:", err.filename);
    console.log("Line:", err.lineno);
  };
  tcpw.onmessage = (msg) => { console.log("Data from worker:", JSON.stringify(msg.data.header)); };
  nmpw.onmessage = (h) => { globalState.scanlist=h.data; }
  let started = false;

  export default Vue.extend({
    computed: {
      scanlist() {
        return globalState.scanlist;
      }
    },
    data() {
      return {
        netutils: netutils,
      }
    },
    methods: {
      logMessage() {
        console.log('You have tapped the message!')
      },

      goToConfig(){
        this.$navigateTo(Config)
      },

      getClass(device: NmapHost) {
        return device.isSafe ? "safe" : "unsafe";
      },
      getButtonClass(device: NmapHost) {
        return device.isSafe ? "unsafe-button" : "safe-button";
      },
      getButtonText(device: NmapHost) {
        return device.isSafe ? "Mark Unsafe" : "Mark Safe";
      },
      toggleSafe(device: NmapHost) {
        device.isSafe = !device.isSafe;
      },

      scanDevices(){
        nmpw.postMessage({})
      },

      hosts2list(h : { name: string; type: string }[]) {
        return [].concat(h).map(i => (i.name || 'None')).join(", ");
      },
      addrs2list(h : NmapAddress[]) {
        return [].concat(h).map(i => (i.addrtype+':'+i.addr)).join(", ");
      },
},

    mounted() {
      if (!started) {
        console.log("Starting workers...")
        nmpw.postMessage({});
        tcpw.postMessage({});
        started = true;
      }
    }
  });
</script>

<style>
.safe {
  color: green;
}
.safe-button {
  background-color: #80ff80;
}
.unsafe {
  color: red;
}
.unsafe-button {
  background-color: #ff8080;
}
</style>
