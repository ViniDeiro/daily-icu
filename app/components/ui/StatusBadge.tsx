import { View, Text } from "react-native";
import { styled } from "nativewind";

const StyledView = styled(View);
const StyledText = styled(Text);

interface StatusBadgeProps {
    status: "stable" | "critical" | "warning" | "neutral" | "success";
    label: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
    const styles = {
        stable: "bg-zinc-100 border-zinc-200 text-zinc-900",
        critical: "bg-red-50 border-red-200 text-red-700",
        warning: "bg-amber-50 border-amber-200 text-amber-700",
        success: "bg-emerald-50 border-emerald-200 text-emerald-700",
        neutral: "bg-zinc-50 border-zinc-200 text-zinc-500",
    };

    const style = styles[status] || styles.neutral;
    // Extract classes manually or just use dynamic string interpolation carefully
    const [bg, border, text] = style.split(" ");

    // Simpler approach
    const bgColors = {
        stable: "bg-zinc-100",
        critical: "bg-red-50",
        warning: "bg-amber-50",
        success: "bg-emerald-50",
        neutral: "bg-zinc-50",
    };
    const borderColors = {
        stable: "border-zinc-200",
        critical: "border-red-200",
        warning: "border-amber-200",
        success: "border-emerald-200",
        neutral: "border-zinc-200",
    };
    const textColors = {
        stable: "text-zinc-900",
        critical: "text-red-700",
        warning: "text-amber-700",
        success: "text-emerald-700",
        neutral: "text-zinc-500",
    };

    return (
        <StyledView className={`${bgColors[status]} border ${borderColors[status]} px-2 py-1 rounded-sm self-start`}>
            <StyledText className={`${textColors[status]} text-xs font-bold uppercase tracking-wide`}>
                {label}
            </StyledText>
        </StyledView>
    );
}
