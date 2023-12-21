import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  Portal,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

type GidInputBoxProps = {
  gameName: string;
  setGameName: (e: string) => void;
};
export const GidInputBox = ({ gameName, setGameName }: GidInputBoxProps) => {
  const [inputValue, setInputValue] = useState(gameName);

  useEffect(() => {
    setInputValue(gameName);
  }, [gameName]);

  return (
    <>
      <Text>Enter a Game ID:</Text>
      <TextInput
        value={inputValue}
        onChangeText={setInputValue}
        onBlur={() => {
          if (inputValue != gameName) {
            setGameName(inputValue);
          }
        }}
        mode="outlined"
        accessibilityLabelledBy={undefined}
        accessibilityLanguage={undefined}
        autoCapitalize="none"
      />
    </>
  );
};
