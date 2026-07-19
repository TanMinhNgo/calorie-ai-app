import { View, Text, Image, Pressable } from 'react-native'
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Typography } from 'heroui-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button, BUTTON_LABEL_CLASSNAME } from '@/components/ui/button';

const onboardingTwoImage = require("@/assets/images/onboarding/onboarding-two.png");

const OnboardingTwo = () => {
  const router = useRouter()
  const inset = useSafeAreaInsets()
  return (
    <View className='flex-1 bg-background' style={{ paddingTop: inset.top}}>
      <BlurView intensity={90} tint="default">
        <View className="absolute top-20 -left-3 right-0 size-120 overflow-hidden rounded-full">
          <View className="absolute inset-0 bg-primary/5" />
        </View>
      </BlurView>

      <View className='flex-1 items-center justify-center px-6 pt-10'>
        <View className="relative items-center justify-center overflow-hidden">
          <Image
            source={onboardingTwoImage}
            resizeMode="cover"
            className="w-77 h-102"
          />
        </View>

        <View className="mt-0 w-full items-center gap-4">
          <Typography
            type="h2"
            className="text-center text-[30px] font-semibold tracking-[-0.75px] text-heading"
          >
            Scan Your Meals
          </Typography>
          <Typography
            type="body"
            className="text-center text-[14px] leading-5.75 text-neutral-400 font-inter">
            Just snap a photo, and our AI instantly identifies{"\n"}ingredients
            and nutrition.
          </Typography>
        </View>

        <View className="absolute left-8 right-8 top-0 flex-row items-center justify-between h-16">
          <View className="flex-row items-center gap-2">
            <LinearGradient
              colors={["#006a68", "#2ab3b1"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="h-8 w-8 items-center justify-center rounded-full"
            >
              <Ionicons name="restaurant" size={14} color="white" />
            </LinearGradient>
            <Typography className="text-xl font-bold tracking-[-1px] text-primary-light font-inter">
              Calorie AI
            </Typography>
          </View>
          <Pressable onPress={() => router.push("/sign-in")}>
            <Text className="text-[14px] font-medium text-neutral-400 font-inter">
              Skip
            </Text>
          </Pressable>
        </View>
      </View>

      <View className="items-center gap-8 px-8 pb-12">
        {/* Progress Dots */}
        <View className="flex-row items-center gap-3">
          <View className="h-2 w-2 rounded-full bg-[#27272a]" />
          <View
            className="h-2 w-8 rounded-full bg-primary-light"
            style={{
              shadowColor: "#2ab3b1",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.3,
              shadowRadius: 25,
            }}
          />
          <View className="h-2 w-2 rounded-full bg-[#27272a]" />
        </View>

        {/* Continue Button */}
        <Button
          onPress={() => router.push("/onboarding-three")}
          className="w-full"
        >
          <View className="flex-row items-center justify-center gap-2">
            <Button.Label className={BUTTON_LABEL_CLASSNAME}>
              Continue
            </Button.Label>
            <Ionicons name="arrow-forward" size={16} color="white" />
          </View>
        </Button>
      </View>
    </View>
  )
}

export default OnboardingTwo