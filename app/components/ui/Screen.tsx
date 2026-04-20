import { View, ScrollView, ViewProps } from "react-native";
import { styled } from "nativewind";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = ViewProps & {
    scroll?: boolean;
    contentContainerClassName?: string;
    safeAreaEdges?: ('top' | 'right' | 'bottom' | 'left')[];
};

const StyledSafeAreaView = styled(SafeAreaView);
const StyledScrollView = styled(ScrollView);
const StyledView = styled(View);

export function Screen({ children, scroll, className, contentContainerClassName, safeAreaEdges = ['top', 'left', 'right'], ...props }: ScreenProps) {
    const Container = scroll ? StyledScrollView : StyledView;

    // We use safeAreaEdges to allow controlling if we want bottom padding or not (sometimes tabs handle it)
    // Defaulting to not including 'bottom' in some cases might be needed if tabs are present, but here we default to top/left/right.
    // Actually, for a detail screen, we usually want bottom too. Let's default to all.
    const edges = safeAreaEdges || ['top', 'bottom', 'left', 'right'];

    return (
        <StyledSafeAreaView 
            className={`flex-1 ${className || 'bg-slate-50'}`} 
            edges={edges}
            {...props}
        >
            <StatusBar style="dark" />
            <Container
                className="flex-1"
                contentContainerClassName={scroll ? `pb-8 ${contentContainerClassName}` : undefined}
            >
                {!scroll && contentContainerClassName ? (
                    <StyledView className={contentContainerClassName}>{children}</StyledView>
                ) : (
                    children
                )}
            </Container>
        </StyledSafeAreaView>
    );
}
