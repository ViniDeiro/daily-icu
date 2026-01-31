import { View, ScrollView, SafeAreaView, ViewProps } from "react-native";
import { styled } from "nativewind";
import { StatusBar } from "expo-status-bar";

type ScreenProps = ViewProps & {
    scroll?: boolean;
    contentContainerClassName?: string;
};

const StyledSafeAreaView = styled(SafeAreaView);
const StyledScrollView = styled(ScrollView);
const StyledView = styled(View);

export function Screen({ children, scroll, className, contentContainerClassName, ...props }: ScreenProps) {
    const Container = scroll ? StyledScrollView : StyledView;

    return (
        <StyledSafeAreaView className={`flex-1 bg-white ${className}`} {...props}>
            <StatusBar style="dark" />
            <Container
                className="flex-1"
                contentContainerClassName={scroll ? `pb-8 ${contentContainerClassName}` : undefined}
            // For View, we might just apply the class directly if not scrolling, but usually View doesn't have contentContainer
            // If View, apply to style or className? View doesn't support contentContainerClassName.
            // Let's assume for View we just use className on the wrapper if needed, but here we want inner styling.
            // If not scroll, we render View. View takes className. 
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
