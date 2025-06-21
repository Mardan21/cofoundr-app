// import { GOOGLE_CLIENT_ID } from "@/constants/OAuth";
// import { useAuth } from "@/hooks/useAuth";
// import { User } from "@/types/User";
// import * as AuthSession from "expo-auth-session";
// import { useRouter } from "expo-router";
// import * as WebBrowser from "expo-web-browser";
// import React, { useEffect, useState } from "react";
// import { Alert, StyleSheet, View } from "react-native";
// import { ActivityIndicator, Button, Text, Title } from "react-native-paper";

// WebBrowser.maybeCompleteAuthSession();

// export default function LoginScreen() {
//   const [isLoading, setIsLoading] = useState(false);
//   const { login } = useAuth();
//   const router = useRouter();

//   // const redirectUri = AuthSession.makeRedirectUri({
//   //   scheme: "cofounderconnect",
//   //   useProxy: true, // This is the key change!
//   // });

//   const [googleRequest, googleResponse, googlePromptAsync] =
//     AuthSession.useAuthRequest(
//       {
//         clientId: GOOGLE_CLIENT_ID,
//         scopes: ["openid", "profile", "email"],
//         responseType: AuthSession.ResponseType.Token,
//         redirectUri: AuthSession.makeRedirectUri({
//           scheme: "cofounderconnect",
//         }),
//         usePKCE: false, // disable PKCE for Google
//         prompt: AuthSession.Prompt.SelectAccount, // force account selection
//       },
//       {
//         authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
//       }
//     );

//   useEffect(() => {
//     if (googleResponse?.type === "success" && googleResponse.authentication) {
//       handleGoogleResponse();
//     }
//   }, [googleResponse]);

//   const handleGoogleResponse = async () => {
//     if (googleResponse?.type === "success" && googleResponse.authentication) {
//       setIsLoading(true);
//       try {
//         const mockUser: User = {
//           id: Date.now().toString(),
//           email: "user@example.com",
//           name: "",
//           profileType: null as any,
//           companyName: "",
//           showCompany: true,
//           bio: "",
//           createdAt: new Date().toISOString(),
//         };

//         await login(
//           {
//             accessToken: googleResponse.authentication.accessToken,
//             expiresIn: googleResponse.authentication.expiresIn,
//           },
//           mockUser
//         );

//         router.replace("/(app)/profile-setup");
//       } catch (error) {
//         Alert.alert("Error", "Failed to sign in. Please try again.");
//       } finally {
//         setIsLoading(false);
//       }
//     }
//   };

//   const handleAppleSignIn = async () => {
//     Alert.alert("Coming Soon", "Apple Sign In will be available soon!");
//   };

//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" />
//         <Text style={styles.loadingText}>Signing you in...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.content}>
//         <Title style={styles.title}>Sign In</Title>
//         <Text style={styles.subtitle}>
//           Choose your preferred sign-in method
//         </Text>
//       </View>

//       <View style={styles.buttonContainer}>
//         <Button
//           mode="contained"
//           onPress={() => googlePromptAsync()}
//           disabled={!googleRequest}
//           style={[styles.button, styles.googleButton]}
//           contentStyle={styles.buttonContent}
//           icon="google"
//         >
//           Continue with Google
//         </Button>

//         <Button
//           mode="contained"
//           onPress={handleAppleSignIn}
//           style={[styles.button, styles.appleButton]}
//           contentStyle={styles.buttonContent}
//           icon="apple"
//         >
//           Continue with Apple
//         </Button>
//       </View>

//       <Text style={styles.disclaimer}>
//         By signing in, you agree to our Terms of Service and Privacy Policy
//       </Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     paddingHorizontal: 20,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingText: {
//     marginTop: 16,
//     fontSize: 16,
//     color: "#666",
//   },
//   content: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "bold",
//     marginBottom: 16,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: "#666",
//     textAlign: "center",
//   },
//   buttonContainer: {
//     paddingBottom: 20,
//   },
//   button: {
//     marginVertical: 8,
//   },
//   buttonContent: {
//     paddingVertical: 8,
//   },
//   googleButton: {
//     backgroundColor: "#4285F4",
//   },
//   appleButton: {
//     backgroundColor: "#000",
//   },
//   disclaimer: {
//     textAlign: "center",
//     fontSize: 12,
//     color: "#666",
//     paddingBottom: 40,
//   },
// });

// login.tsx
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/types/User";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Text, Title } from "react-native-paper";

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleMockLogin = async () => {
    setIsLoading(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockUser: User = {
      id: "mock-user-123",
      email: "test@example.com",
      name: "", // Empty so they go to profile setup
      profileType: null,
      companyName: "",
      showCompany: true,
      bio: "",
      createdAt: new Date().toISOString(),
    };

    await login(
      {
        accessToken: "mock-access-token",
        expiresIn: 3600,
      },
      mockUser
    );

    setIsLoading(false);
    router.replace("/(app)/profile-setup");
  };

  const handleAppleSignIn = async () => {
    Alert.alert("Coming Soon", "Apple Sign In will be available soon!");
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Signing you in...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Title style={styles.title}>Sign In</Title>
        <Text style={styles.subtitle}>
          Choose your preferred sign-in method
        </Text>

        {/* DEV MODE NOTICE */}
        <Text style={styles.devNotice}>
          🚧 OAuth temporarily disabled - Click any button to continue 🚧
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleMockLogin}
          style={[styles.button, styles.googleButton]}
          contentStyle={styles.buttonContent}
          icon="google"
        >
          Continue with Google
        </Button>

        <Button
          mode="contained"
          onPress={handleMockLogin}
          style={[styles.button, styles.appleButton]}
          contentStyle={styles.buttonContent}
          icon="apple"
        >
          Continue with Apple
        </Button>
      </View>

      <Text style={styles.disclaimer}>
        By signing in, you agree to our Terms of Service and Privacy Policy
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  devNotice: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#fff3cd",
    color: "#856404",
    borderRadius: 5,
    fontSize: 14,
  },
  buttonContainer: {
    paddingBottom: 20,
  },
  button: {
    marginVertical: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  googleButton: {
    backgroundColor: "#4285F4",
  },
  appleButton: {
    backgroundColor: "#000",
  },
  disclaimer: {
    textAlign: "center",
    fontSize: 12,
    color: "#666",
    paddingBottom: 40,
  },
});
