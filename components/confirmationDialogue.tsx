import React, { useState } from "react"
import { Button, Dialog, Portal, Text, useTheme } from "react-native-paper"

type ConfirmationDialogueProps = {
    showing: boolean,
    setShowing: (e: boolean) => void,
    confirmationText: string,
    action: () => void
}

export const ConfirmationDialogue = ({ showing, setShowing, confirmationText, action }: ConfirmationDialogueProps) => {
    const theme = useTheme();
    return (<>
        <Portal>
            <Dialog visible={showing} onDismiss={() => setShowing(false)}>
                <Dialog.Icon
                    icon="alert-octagon"
                    size={32}
                    color={theme.colors.error}
                />
                <Dialog.Content>
                    <Text variant="bodyMedium">{confirmationText}</Text>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button key={'closeButton'} onPress={() => setShowing(false)}>
                        Back
                    </Button>
                    <Button key={'closeButton'} onPress={() => { setShowing(false); action() }}>
                        Continue
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    </>)
}