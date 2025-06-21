import { ProfileSetupData } from "@/types/User";
import {
  validateGitHubUsername,
  validateLinkedInUrl,
} from "@/utils/validation";
import React from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  HelperText,
  Switch,
  Text,
  TextInput,
  Title,
} from "react-native-paper";

interface StepTwoProps {
  formData: ProfileSetupData;
  setFormData: (data: ProfileSetupData) => void;
  errors: Partial<ProfileSetupData>;
  setErrors: (errors: Partial<ProfileSetupData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepTwo({
  formData,
  setFormData,
  errors,
  setErrors,
  onNext,
  onBack,
}: StepTwoProps) {
  const validate = () => {
    const newErrors: Partial<ProfileSetupData> = {};

    if (formData.linkedinUrl && !validateLinkedInUrl(formData.linkedinUrl)) {
      newErrors.linkedinUrl = "Please enter a valid LinkedIn URL";
    }
    if (
      formData.githubUsername &&
      !validateGitHubUsername(formData.githubUsername)
    ) {
      newErrors.githubUsername = "Please enter a valid GitHub username";
    }
    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
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
      <Title style={styles.stepTitle}>Professional Information</Title>

      <TextInput
        label="LinkedIn URL (optional)"
        value={formData.linkedinUrl}
        onChangeText={(text) => setFormData({ ...formData, linkedinUrl: text })}
        error={!!errors.linkedinUrl}
        style={styles.input}
        placeholder="https://linkedin.com/in/yourprofile"
      />
      <HelperText type="error" visible={!!errors.linkedinUrl}>
        {errors.linkedinUrl}
      </HelperText>

      <TextInput
        label="GitHub Username (optional)"
        value={formData.githubUsername}
        onChangeText={(text) =>
          setFormData({ ...formData, githubUsername: text })
        }
        error={!!errors.githubUsername}
        style={styles.input}
        placeholder="username"
      />
      <HelperText type="error" visible={!!errors.githubUsername}>
        {errors.githubUsername}
      </HelperText>

      <TextInput
        label="Company/Startup Name"
        value={formData.companyName}
        onChangeText={(text) => setFormData({ ...formData, companyName: text })}
        error={!!errors.companyName}
        style={styles.input}
      />
      <HelperText type="error" visible={!!errors.companyName}>
        {errors.companyName}
      </HelperText>

      <View style={styles.switchContainer}>
        <Text>Show company name on profile</Text>
        <Switch
          value={formData.showCompany}
          onValueChange={(value) =>
            setFormData({ ...formData, showCompany: value })
          }
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button mode="outlined" onPress={onBack} style={styles.button}>
          Back
        </Button>
        <Button
          mode="contained"
          onPress={handleNext}
          style={[styles.button, styles.nextButton]}
        >
          Next
        </Button>
      </View>
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
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  nextButton: {
    marginLeft: 8,
  },
});
