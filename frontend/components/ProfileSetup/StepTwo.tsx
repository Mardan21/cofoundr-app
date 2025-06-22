import { ProfileSetupData } from "@/types/User";
import { validateLinkedInUrl } from "@/utils/validation";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  HelperText,
  IconButton,
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
  const [additionalLinks, setAdditionalLinks] = useState(
    formData.links.filter(link => link.name !== 'LinkedIn') || []
  );

  const validate = () => {
    const newErrors: Partial<ProfileSetupData> = {};

    if (!formData.linkedinId.trim()) {
      newErrors.linkedinId = "LinkedIn profile URL is required";
    } else if (!validateLinkedInUrl(formData.linkedinId)) {
      newErrors.linkedinId = "Please enter a valid LinkedIn URL";
    }

    if (!formData.startupIdea.trim()) {
      newErrors.startupIdea = "Startup idea is required";
    } else if (formData.startupIdea.length < 20) {
      newErrors.startupIdea = "Please provide more details about your startup idea";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      // Update links array with LinkedIn and additional links
      const allLinks = [
        { name: 'LinkedIn', url: formData.linkedinId },
        ...additionalLinks.filter(link => link.name && link.url)
      ];
      setFormData({ ...formData, links: allLinks });
      onNext();
    }
  };

  const addLink = () => {
    setAdditionalLinks([...additionalLinks, { name: '', url: '' }]);
  };

  const updateLink = (index: number, field: 'name' | 'url', value: string) => {
    const updated = [...additionalLinks];
    updated[index] = { ...updated[index], [field]: value };
    setAdditionalLinks(updated);
  };

  const removeLink = (index: number) => {
    setAdditionalLinks(additionalLinks.filter((_, i) => i !== index));
  };

  return (
    <View>
      <Title style={styles.stepTitle}>Professional Information</Title>

      <TextInput
        label="LinkedIn Profile URL *"
        value={formData.linkedinId}
        onChangeText={(text) => setFormData({ ...formData, linkedinId: text })}
        error={!!errors.linkedinId}
        style={styles.input}
        placeholder="https://linkedin.com/in/yourprofile"
        autoCapitalize="none"
      />
      <HelperText type="error" visible={!!errors.linkedinId}>
        {errors.linkedinId}
      </HelperText>

      <TextInput
        label="Startup Idea *"
        value={formData.startupIdea}
        onChangeText={(text) => setFormData({ ...formData, startupIdea: text })}
        error={!!errors.startupIdea}
        style={styles.input}
        multiline
        numberOfLines={3}
        placeholder="Describe your startup idea, what problem it solves, and your vision..."
      />
      <HelperText type="error" visible={!!errors.startupIdea}>
        {errors.startupIdea}
      </HelperText>

      <Text style={styles.sectionTitle}>Additional Links (Optional)</Text>
      {additionalLinks.map((link, index) => (
        <View key={index} style={styles.linkRow}>
          <TextInput
            label="Platform Name"
            value={link.name}
            onChangeText={(text) => updateLink(index, 'name', text)}
            style={[styles.input, styles.linkNameInput]}
            placeholder="e.g., GitHub, Twitter"
          />
          <TextInput
            label="URL"
            value={link.url}
            onChangeText={(text) => updateLink(index, 'url', text)}
            style={[styles.input, styles.linkUrlInput]}
            placeholder="https://..."
            autoCapitalize="none"
          />
          <IconButton
            icon="delete"
            size={24}
            onPress={() => removeLink(index)}
            style={styles.deleteButton}
          />
        </View>
      ))}

      <Button
        mode="outlined"
        onPress={addLink}
        style={styles.addLinkButton}
        icon="plus"
      >
        Add Link
      </Button>

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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 12,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  linkNameInput: {
    flex: 1,
    marginRight: 8,
  },
  linkUrlInput: {
    flex: 2,
    marginRight: 8,
  },
  deleteButton: {
    marginTop: 8,
  },
  addLinkButton: {
    marginTop: 8,
    marginBottom: 20,
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
