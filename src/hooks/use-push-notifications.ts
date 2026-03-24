"use client";

import { useEffect, useState } from "react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_KEY!;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function usePushNotifications() {
    const [supported, setSupported] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>("default");

    useEffect(() => {
        if ("serviceWorker" in navigator && "PushManager" in window) {
            setSupported(true);
            setPermission(Notification.permission);

            // Register service worker
            navigator.serviceWorker.register("/sw.js").then((reg) => {
                reg.pushManager.getSubscription().then((sub) => {
                    setSubscribed(!!sub);
                });
            }).catch(console.error);
        }
    }, []);

    async function subscribe() {
        if (!supported) return;
        setLoading(true);
        try {
            const reg = await navigator.serviceWorker.ready;
            const permission = await Notification.requestPermission();
            setPermission(permission);

            if (permission !== "granted") {
                setLoading(false);
                return;
            }

            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as any,
            });

            await fetch("/api/push/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subscription: sub.toJSON() }),
            });

            setSubscribed(true);
        } catch (err) {
            console.error("Push subscribe failed:", err);
        } finally {
            setLoading(false);
        }
    }

    async function unsubscribe() {
        if (!supported) return;
        setLoading(true);
        try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.getSubscription();
            if (sub) {
                await fetch("/api/push/subscribe", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ endpoint: sub.endpoint }),
                });
                await sub.unsubscribe();
            }
            setSubscribed(false);
        } catch (err) {
            console.error("Push unsubscribe failed:", err);
        } finally {
            setLoading(false);
        }
    }

    return { supported, subscribed, loading, permission, subscribe, unsubscribe };
}
