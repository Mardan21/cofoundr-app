import { ProfileSetupData } from "@/types/User";
import React from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  HelperText,
  RadioButton,
  Text,
  TextInput,
  Title,
} from "react-native-paper";

interface StepOneProps {
  formData: ProfileSetupData;
  setFormData: (data: ProfileSetupData) => void;
  errors: Partial<ProfileSetupData>;
  setErrors: (errors: Partial<ProfileSetupData>) => void;
  onNext: () => void;
}

export default function StepOne({
  formData,
  setFormData,
  errors,
  setErrors,
  onNext,
}: StepOneProps) {
  const validate = () => {
    const newErrors: Partial<ProfileSetupData> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    }
    if (!formData.profileType) {
      newErrors.profileType = "Please select a profile type" as any;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <View>
      <Title style={styles.stepTitle}>Basic Information</Title>

      <TextInput
        label="Full Name"
        value={formData.full_name}
        onChangeText={(text) => setFormData({ ...formData, full_name: text })}
        error={!!errors.full_name}
        style={styles.input}
        placeholder="Enter your full name"
      />
      <HelperText type="error" visible={!!errors.full_name}>
        {errors.full_name}
      </HelperText>

      <Text style={styles.label}>I am a:</Text>
      <RadioButton.Group
        onValueChange={(value) =>
          setFormData({ ...formData, profileType: value as any })
        }
        value={formData.profileType || ""}
      >
        <RadioButton.Item label="Founder" value="founder" />
        <RadioButton.Item label="Co-founder" value="cofounder" />
        <RadioButton.Item label="Mentor" value="mentor" />
        <RadioButton.Item label="Investor" value="investor" />
      </RadioButton.Group>
      <HelperText type="error" visible={!!errors.profileType}>
        {errors.profileType}
      </HelperText>

      <Button mode="contained" onPress={handleNext} style={styles.button}>
        Next
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  stepTitle: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  button: {
    marginTop: 40,
  },
});
