import { Text, View, ViewProps } from "react-native";
import { styled } from "nativewind";

const StyledView = styled(View);
const StyledText = styled(Text);

export function Divider({ className, ...props }: ViewProps & { className?: string }) {
    return <StyledView className={`h-[1px] bg-zinc-200 my-4 ${className}`} {...props} />;
}

export function SectionTitle({ title, right }: { title: string; right?: React.ReactNode }) {
    return (
        <StyledView className="flex-row items-center justify-between mb-2 mt-4 first:mt-0">
            <StyledText className="text-base font-bold text-text uppercase tracking-tight">{title}</StyledText>
            {right}
        </StyledView>
    );
}

export function KeyValueRow({ k, v }: { k: string; v: string | React.ReactNode }) {
    return (
        <StyledView className="flex-row justify-between py-2 border-b border-zinc-100 last:border-0">
            <StyledText className="text-zinc-500 font-medium">{k}</StyledText>
            {typeof v === "string" ? <StyledText className="font-bold text-text text-right flex-1 ml-4">{v}</StyledText> : v}
        </StyledView>
    );
}

export function ChipsRow({ children, className }: ViewProps & { className?: string }) {
    return <StyledView className={`flex-row flex-wrap gap-2 ${className}`}>{children}</StyledView>;
}
