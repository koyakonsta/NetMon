<template>
  <Page>
    <ActionBar>
      <Label text="Home" class="font-bold text-lg"/>
      <ActionItem text="Devices" android.position="actionBar" @tap="goToDevices"/>
      <ActionItem text="Config" android.position="actionBar" @tap="goToConfig"/>
    </ActionBar>

    <StackLayout>
      <Button text="Scan Network" col="1" @tap="scanDevices"></Button>
      <ListView :items="scanlist" class="list">
        <v-template v-slot="{ item }">
          <GridLayout columns="*,*" rows="auto,auto">
              <Label row="0" col="0" textWrap="true" :text="'\tStatus: '+item.status.state" />
              <Label row="0" col="1" textWrap="true" :text="'Address:'+addrs2list(item.address)" />
              <Label row="1" col="1" textWrap="true" :text="'Vendor: '+item.vendor" />
              <Label row="1" col="0" textWrap="true" :text="'\tHostname: '+hosts2list(item.hostnames) " />
          </GridLayout>
        </v-template>
      </ListView>
    </StackLayout>
  </Page>
</template>

<script lang="ts">
  import Vue from "nativescript-vue";
  import DeviceList from "@/components/DeviceList.vue";
  import Config from "@/components/Config.vue";
  import { Utils } from "@nativescript/core"
  import {globalState} from "~/store";
  import * as netutils from "~/netutils";
  import {NmapAddress} from "~/netutils";
  const nmpw = new Worker('~/nmapworker.ts');
  const tcpw = new Worker('~/tcpworker.ts');
  tcpw.onerror = (err) => {
    console.log("WORKER CRASHED:", err.message);
    console.log("FILENAME:", err.filename);
    console.log("LINE:", err.lineno);
  };
  tcpw.onmessage = (msg) => { console.log("DATA FROM WORKER:", JSON.stringify(msg.data.header)); };
  nmpw.onmessage = (h) => { globalState.scanlist=h.data; }

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

      goToDevices() {
        this.$navigateTo(DeviceList)
      },
      goToConfig(){
        this.$navigateTo(Config)
      },
      scanDevices(){
        // nmpw.postMessage({})
        tcpw.postMessage({})
      },

      hosts2list(h : { name: string; type: string }[]) {
        return [].concat(h).map(i => (i.name || 'None')).join(", ");
      },
      addrs2list(h : NmapAddress[]) {
        return [].concat(h).map(i => (i.addrtype+':'+i.addr)).join(", ");
      },
},

    mounted() {
      // tcpdump.getRoot()

      // tcpdump.copyBinary()
      // tcpdump.setExecutable()
      // tcpdump.getPackets()
    }
  });
</script>

<style>
</style>
