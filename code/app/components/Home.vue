<template>
  <Page>
    <ActionBar>
      <Label text="Home" class="font-bold text-lg"/>
      <ActionItem text="Devices" android.position="actionBar" @tap="goToDevices"/>
    </ActionBar>

    <StackLayout>
      <Label class="text-xl align-middle text-center text-gray-500" :text="message" @tap="logMessage" />
      <Button text="Scan Network" col="1" @tap="netutils.runNmapScan()"></Button>
      <Button text="Start TCPDump" col="2" @tap="tcpdump.getPackets()"></Button>
    </StackLayout>
  </Page>
</template>

<script lang="ts">
  import Vue from "nativescript-vue";
  import DeviceList from "@/components/DeviceList.vue";
  import { Utils } from "@nativescript/core"
  import * as netutils from "~/netutils";
  import * as tcpdump from "~/tcpdump";

  export default Vue.extend({
    computed: {
      message() {
        return "This is the homepage";
      },
    },
    data() {
      return {
        netutils: netutils,
        tcpdump: tcpdump,
      }
    },
    methods: {
      logMessage() {
        console.log('You have tapped the message!')
      },

      goToDevices() {
        this.$navigateTo(DeviceList)
      }
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
