<template>
  <Page>
    <ActionBar>
      <Label text="Home" class="font-bold text-lg"/>
      <ActionItem text="Devices" android.position="actionBar" @tap="goToDevices"/>
    </ActionBar>

    <StackLayout>
      <Button text="Scan Network" col="1" @tap="doScan"></Button>
      <ListView :items="scanlist" class="list">
        <v-template v-slot="{ item }">
          <Label :text="'Status: '+item.status.state+'\tAddress: '+addrs2list(item.address)+'\tHostname: '+hosts2list(item.hostnames) " />
        </v-template>
      </ListView>
    </StackLayout>
  </Page>
</template>

<script lang="ts">
  import Vue from "nativescript-vue";
  import DeviceList from "@/components/DeviceList.vue";
  import { Utils } from "@nativescript/core"
  import * as netutils from "~/netutils";
  import {globalState} from "~/store";
  import {NmapAddress} from "~/netutils";

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

      doScan(){
        globalState.scanlist = netutils.runNmapScan();
      },

      hosts2list(h : { name: string; type: string } | { name: string; type: string }[]) {
        return [].concat(h as any).map(h => h.name || 'None').join(", ");
      },
      addrs2list(h : NmapAddress) {
        return [].concat(h as any).map(h => h.addrtype+':'+h.addr).join(", ");
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
