"use client";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Loader2, BellRing } from "lucide-react";
import { toast } from "sonner";

export function PushNotificationButton({ className }: { className?: string }) {
    const { supported, subscribed, loading, permission, subscribe, unsubscribe } = usePushNotifications();

    if (!supported) return null;

    async function handleClick() {
        if (subscribed) {
            await unsubscribe();
            toast.success("Ogeysiisyada waa la joojiyay.");
        } else {
            if (permission === "denied") {
                toast.error("Fadlan browser-ka u ogolow ogeysiisyada (Settings → Notifications).");
                return;
            }
            await subscribe();
            toast.success("✅ Ogeysiisyada waa la shidday! Hadda waxaad heli doontaa notifications tooska ah.");
        }
    }

    return (
        <Button
            onClick={handleClick}
            disabled={loading}
            variant={subscribed ? "secondary" : "default"}
            className={className}
            size="sm"
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : subscribed ? (
                <><BellOff className="h-4 w-4 mr-1.5" /> Jooji Ogeysiisyada</>
            ) : (
                <><BellRing className="h-4 w-4 mr-1.5" /> Ogeysiisyada Shid</>
            )}
        </Button>
    );
}
