import {LocalNotifications} from "@nativescript/local-notifications/index.android";
import {markDeviceUnsafe} from "~/packets";

export function sendNotification(title: string, body: string, deviceAddress: string) {
  LocalNotifications.schedule([{
    id: 1,
    title: title,
    body: body,
    ticker: "Security Warning",
    priority: 2, // high
    payload: { deviceAddress: deviceAddress },
    actions: [
      {
        id: "mark-unsafe",
        type: "button",
        title: "Mark Unsafe",
        launch: false,
      },
      {
        id: "ignore",
        type: "button",
        title: "Dismiss",
        launch: false,
      }
    ]
  }]).then(
    (scheduledIds) => {
      console.log('Notification id(s) scheduled: ' + JSON.stringify(scheduledIds))
    },
    (error) => {
      console.log('scheduling error: ' + error)
    },
  );
}

LocalNotifications.addOnMessageReceivedCallback(notification => {
  if (notification.event === "button") {
    switch (notification.response) {
      case "mark-unsafe":
        return markDeviceUnsafe(notification.payload.deviceAddress);
      case "ignore":
        return console.log("User dismissed threat for " + notification.payload.deviceAddress);
    }
  }
})
