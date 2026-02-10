<template>
  <Page>
    <ActionBar>
      <Label text="Home" class="font-bold text-lg"/>
      <ActionItem text="Devices" android.position="actionBar" @tap="goToDevices"/>
    </ActionBar>

    <StackLayout>
      <Button text="Scan Network" col="1" @tap="scanDevices"></Button>
      <ListView :items="scanlist" class="list">
        <v-template v-slot="{ item }">
          <GridLayout columns="*,*" rows="auto,auto">
              <Label row="0" col="0" textWrap="true" :text="'\tStatus: '+item.status.state" />
              <Label row="0" col="1" textWrap="true" :text="'\tAddress:\n '+addrs2list(item.address)" />
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
  import { Utils } from "@nativescript/core"
  import {globalState} from "~/store";
  import * as netutils from "~/netutils";
  import {NmapAddress} from "~/netutils";
  const nmpw = new Worker('~/nmapworker.ts');
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

      scanDevices(){
        nmpw.postMessage({})
      },

      hosts2list(h : { name: string; type: string }[]) {
        return [].concat(h).map(i => (i.name || 'None')).join(", ");
      },
      addrs2list(h : NmapAddress[]) {
        console.log(JSON.stringify(h));
        return [].concat(h).map(i => (i.addrtype+':'+i.addr)).join(", ");
      },
},

    mounted() {
      const context = Utils.android.getApplicationContext()
      const wifiManager = context.getSystemService(android.content.Context.WIFI_SERVICE) as android.net.wifi.WifiManager

      const ipInt = wifiManager.getConnectionInfo().getIpAddress()
      const ip = (ipInt & 0xff) + "." + ((ipInt >> 8) & 0xff) + "." + ((ipInt >> 16) & 0xff) + "." + ((ipInt >> 24) & 0xff)
      console.log("Local IP:", ip)

      const dhcp = wifiManager.getDhcpInfo()
      const gateway = (dhcp.gateway & 0xff) + "." + ((dhcp.gateway >> 8) & 0xff) + "." + ((dhcp.gateway >> 16) & 0xff) + "." + ((dhcp.gateway >> 24) & 0xff)
      console.log("Gateway:", gateway)
    }
  });
</script>

<style>
</style>
