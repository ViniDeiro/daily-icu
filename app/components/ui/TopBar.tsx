import { View, Text, TouchableOpacity } from "react-native";
import { styled } from "nativewind";
import { useRouter } from "expo-router";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface TopBarProps {
    title: string;
    subtitle?: string;
    back?: boolean;
    onBack?: () => void;
    action?: React.ReactNode;
}

export function TopBar({ title, subtitle, back, onBack, action }: TopBarProps) {
    const r = useRouter();

    const handleBack = () => {
        if (onBack) onBack();
        else r.back();
    };

    return (
        <StyledView className="px-6 pt-4 pb-6 bg-white border-b border-slate-100 shadow-sm z-10">
            <StyledView className="flex-row items-center justify-between">
                <StyledView className="flex-1 min-w-0 pr-4">
                    {back && (
                        <StyledTouchableOpacity 
                            onPress={handleBack} 
                            className="mb-3 self-start bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 active:bg-slate-100"
                        >
                            <StyledText className="text-xs font-bold text-slate-600 uppercase tracking-wider">← Voltar</StyledText>
                        </StyledTouchableOpacity>
                    )}
                    <StyledText className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight" numberOfLines={1}>
                        {title}
                    </StyledText>
                    {subtitle && (
                        <StyledText className="text-slate-500 font-medium text-sm mt-1" numberOfLines={1}>
                            {subtitle}
                        </StyledText>
                    )}
                </StyledView>
                {action && (
                    <StyledView className="shrink-0">
                        {action}
                    </StyledView>
                )}
            </StyledView>
        </StyledView>
    );
}
