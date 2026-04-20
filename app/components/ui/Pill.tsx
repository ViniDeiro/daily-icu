import { View, Text } from "react-native";
import { styled } from "nativewind";

const StyledView = styled(View);
const StyledText = styled(Text);

interface PillProps {
    label: string;
    variant?: "neutral" | "primary" | "success" | "warning" | "critical" | "outline";
    className?: string;
}

export function Pill({ label, variant = "neutral", className }: PillProps) {
    const variants = {
        neutral: "bg-slate-100 border-slate-200 text-slate-600",
        primary: "bg-primary-50 border-primary-200 text-primary-700",
        success: "bg-emerald-50 border-emerald-200 text-emerald-700",
        warning: "bg-amber-50 border-amber-200 text-amber-700",
        critical: "bg-red-50 border-red-200 text-red-700",
        outline: "bg-transparent border-slate-300 text-slate-500 border-dashed"
    };

    const style = variants[variant];
    const [bg, border, text] = style.split(" ");
    // We actually passed the whole string, so we need to split to use logic if needed,
    // but NativeWind handles full strings. The issue is merging className.
    
    // Better way:
    return (
        <StyledView className={`px-3 py-1 rounded-full border self-start flex-row items-center ${variants[variant].replace(/text-\S+/g, "")} ${className}`}>
             <StyledText className={`text-[10px] font-bold uppercase tracking-wider ${variants[variant].match(/text-\S+/)?.[0]}`}>
                {label}
            </StyledText>
        </StyledView>
    );
}
