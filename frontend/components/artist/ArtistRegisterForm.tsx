"use client";

import * as React from "react";
import { useForm, Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight, CheckCircle2, Plus, Trash2, ShieldCheck } from "lucide-react";
import { artistRegisterSchema, ArtistRegisterFormData } from "@/utils/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProgressStepper } from "@/components/ui/progress-stepper";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { VideoUpload } from "@/components/shared/VideoUpload";
import { artistService } from "@/services/artistService";
import toast from "react-hot-toast";

const STEPS = [
  "Account",
  "Basic Info",
  "Band Details",
  "Pricing",
  "Equipment",
  "Media",
  "Availability",
  "Submit"
];

const AVAILABLE_LANGUAGES = ["Tamil", "Telugu", "Malayalam", "Kannada", "Hindi", "English"];
const AVAILABLE_GENRES = ["Melody", "Rock", "Pop", "Classical", "Folk", "Fusion", "DJ", "Others"];

export function ArtistRegisterForm() {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [newYoutubeLink, setNewYoutubeLink] = React.useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting }
  } = useForm<ArtistRegisterFormData>({
    resolver: zodResolver(artistRegisterSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      mobile_number: "",
      password: "",
      confirmPassword: "",
      name: "",
      display_name: "",
      description: "",
      years_of_experience: 0,
      profile_image: "",
      cover_image: "",
      band_type: "Solo",
      total_members: 1,
      languages: [],
      genres: [],
      base_rate: 0,
      currency: "INR",
      travel_radius: 0,
      travel_charges: 0,
      min_booking_hours: 0,
      max_booking_hours: 0,
      equipment: {
        own_speaker: false,
        mic: false,
        mixer: false,
        keyboard: false,
        guitar: false,
        drums: false,
        lighting: false,
        dj_console: false
      },
      gallery: [],
      videos: [],
      youtube_links: [],
      availability: {
        weekly_schedule: {
          Monday: { available: true, start: "09:00", end: "22:00" },
          Tuesday: { available: true, start: "09:00", end: "22:00" },
          Wednesday: { available: true, start: "09:00", end: "22:00" },
          Thursday: { available: true, start: "09:00", end: "22:00" },
          Friday: { available: true, start: "09:00", end: "23:00" },
          Saturday: { available: true, start: "09:00", end: "23:00" },
          Sunday: { available: true, start: "09:00", end: "22:00" }
        },
        holidays: [],
        blocked_dates: []
      },
      acceptTerms: false
    }
  });

  // Watch fields for rendering toggles
  const watchedLanguages = watch("languages") || [];
  const watchedGenres = watch("genres") || [];
  const watchedEquipment = watch("equipment") || {};
  const watchedYoutubeLinks = watch("youtube_links") || [];
  const watchedGallery = watch("gallery") || [];
  const watchedVideos = watch("videos") || [];
  const watchedWeeklySchedule = watch("availability.weekly_schedule") || {};
  const watchedProfileImage = watch("profile_image");
  const watchedCoverImage = watch("cover_image");

  // Step fields validation before going forward
  const getStepFields = (step: number): (keyof ArtistRegisterFormData)[] => {
    switch (step) {
      case 1:
        return ["email", "mobile_number", "password", "confirmPassword"];
      case 2:
        return ["name", "display_name", "description", "years_of_experience"];
      case 3:
        return ["band_type", "total_members", "languages", "genres"];
      case 4:
        return ["base_rate", "currency", "travel_radius", "travel_charges", "min_booking_hours", "max_booking_hours"];
      case 5:
        return ["equipment"];
      case 6:
        return ["gallery", "videos", "youtube_links"];
      case 7:
        return ["availability"];
      case 8:
        return ["acceptTerms"];
      default:
        return [];
    }
  };

  const handleNext = async () => {
    const fields = getStepFields(currentStep);
    const isValid = await trigger(fields);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    } else {
      toast.error("Please correct the errors in the current step before proceeding.");
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleLanguageToggle = (lang: string) => {
    const current = [...watchedLanguages];
    const index = current.indexOf(lang);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(lang);
    }
    setValue("languages", current, { shouldValidate: true });
  };

  const handleGenreToggle = (genre: string) => {
    const current = [...watchedGenres];
    const index = current.indexOf(genre);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(genre);
    }
    setValue("genres", current, { shouldValidate: true });
  };

  const addYoutubeLink = () => {
    if (!newYoutubeLink) return;
    if (!newYoutubeLink.startsWith("http")) {
      toast.error("Please enter a valid URL.");
      return;
    }
    setValue("youtube_links", [...watchedYoutubeLinks, newYoutubeLink]);
    setNewYoutubeLink("");
  };

  const removeYoutubeLink = (idx: number) => {
    const current = [...watchedYoutubeLinks];
    current.splice(idx, 1);
    setValue("youtube_links", current);
  };

  const handleEquipmentChange = (key: string, val: boolean) => {
    setValue(`equipment.${key}` as Path<ArtistRegisterFormData>, val);
  };

  const handleDayAvailabilityToggle = (day: string) => {
    const current = watchedWeeklySchedule[day];
    setValue(`availability.weekly_schedule.${day}.available` as Path<ArtistRegisterFormData>, !current.available);
  };

  const handleDayTimeChange = (day: string, type: "start" | "end", val: string) => {
    setValue(`availability.weekly_schedule.${day}.${type}` as Path<ArtistRegisterFormData>, val);
  };

  const onSubmit = async (data: ArtistRegisterFormData) => {
    try {
      await artistService.register(data);
      setIsSuccess(true);
      toast.success("Band registration submitted successfully!");
    } catch (err) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      const errMsg = error.response?.data?.error?.message || "Registration failed. Please try again.";
      toast.error(errMsg);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-12 text-center max-w-xl mx-auto bg-bg-card/30 backdrop-blur-md border border-border p-8 rounded-3xl shadow-2xl">
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400">
          <CheckCircle2 className="h-16 w-16" />
        </div>
        <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Onboarding Request Received!</h1>
        <p className="text-text-secondary text-base leading-relaxed">
          Thank you for registering your profile on BandConnect. Your request is currently under review by our admin team.
        </p>
        <div className="bg-bg-elevated/40 border border-border/80 w-full p-4 rounded-xl text-left space-y-2">
          <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider">What happens next?</h4>
          <ul className="text-xs text-text-secondary space-y-1 list-disc pl-5">
            <li>Our moderation team will verify your details, photos, and links.</li>
          <li>We&apos;ll contact you at <span className="text-text-primary font-medium">{watch("email")}</span> if we need additional info.</li>
          <li>Once approved, you&apos;ll receive login credentials to access your Band Dashboard!</li>
          </ul>
        </div>
        <Button onClick={() => window.location.href = "/login"} className="w-full font-bold h-11 bg-primary text-white hover:bg-primary/90 mt-4">
          Go to Login Screen
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-bg-card/25 backdrop-blur-lg border border-border/80 p-6 md:p-8 rounded-3xl shadow-2xl space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-text-primary tracking-tight font-heading bg-gradient-to-r from-text-primary via-text-secondary to-primary bg-clip-text text-transparent">
          Band & Performer Registration
        </h1>
        <p className="text-sm text-text-secondary">
          Join our curated live entertainment network and receive bookings directly.
        </p>
      </div>

      {/* Stepper */}
      <ProgressStepper steps={STEPS} currentStep={currentStep} />

      {/* Main Form container */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* STEP 1: ACCOUNT DETAILS */}
        {currentStep === 1 && (
          <div className="space-y-4 transition-all duration-300">
            <h2 className="text-xl font-bold text-text-primary">Step 1: Account Information</h2>
            <p className="text-xs text-text-secondary">Setup your account credentials to log in.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="band@example.com" {...register("email")} />
                {errors.email && <p className="text-xs text-error font-medium">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mobile_number">Mobile Number</Label>
                <Input id="mobile_number" placeholder="+91 99999 88888" {...register("mobile_number")} />
                {errors.mobile_number && <p className="text-xs text-error font-medium">{errors.mobile_number.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
                {errors.password && <p className="text-xs text-error font-medium">{errors.password.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" placeholder="••••••••" {...register("confirmPassword")} />
                {errors.confirmPassword && <p className="text-xs text-error font-medium">{errors.confirmPassword.message}</p>}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: BASIC INFO */}
        {currentStep === 2 && (
          <div className="space-y-4 transition-all duration-300">
            <h2 className="text-xl font-bold text-text-primary">Step 2: Basic Profile Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Band / Artist Name</Label>
                  <Input id="name" placeholder="E.g. The Acoustic Trio" {...register("name")} />
                  {errors.name && <p className="text-xs text-error font-medium">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="display_name">Display Name (Slug-friendly)</Label>
                  <Input id="display_name" placeholder="E.g. theacoustictrio" {...register("display_name")} />
                  {errors.display_name && <p className="text-xs text-error font-medium">{errors.display_name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="years_of_experience">Years of Experience</Label>
                  <Input 
                    id="years_of_experience" 
                    type="number" 
                    placeholder="E.g. 5" 
                    {...register("years_of_experience", { valueAsNumber: true })} 
                  />
                  {errors.years_of_experience && <p className="text-xs text-error font-medium">{errors.years_of_experience.message}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Profile Picture</Label>
                  <ImageUpload 
                    value={watchedProfileImage} 
                    onChange={(url) => setValue("profile_image", url, { shouldValidate: true })} 
                    onRemove={() => setValue("profile_image", "")}
                    subfolder="artists/avatars"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Cover Banner Image</Label>
                  <ImageUpload 
                    value={watchedCoverImage} 
                    onChange={(url) => setValue("cover_image", url, { shouldValidate: true })} 
                    onRemove={() => setValue("cover_image", "")}
                    subfolder="artists/covers"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Band / Artist Description (Bio)</Label>
              <Textarea 
                id="description" 
                rows={4} 
                placeholder="Tell clients about your musical style, key performance history, and what makes your show unique..." 
                {...register("description")} 
              />
              {errors.description && <p className="text-xs text-error font-medium">{errors.description.message}</p>}
            </div>
          </div>
        )}

        {/* STEP 3: BAND DETAILS */}
        {currentStep === 3 && (
          <div className="space-y-6 transition-all duration-300">
            <h2 className="text-xl font-bold text-text-primary">Step 3: Performance Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="band_type">Band / Performer Type</Label>
                <select 
                  id="band_type"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-bg-card text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  {...register("band_type")}
                  onChange={(e) => {
                    setValue("band_type", e.target.value as ArtistRegisterFormData["band_type"]);
                    const membersMap: Record<string, number> = { "Solo": 1, "Duo": 2, "Trio": 3, "4 Members": 4, "5+ Members": 5 };
                    setValue("total_members", membersMap[e.target.value] || 5);
                  }}
                >
                  <option value="Solo">Solo Artist</option>
                  <option value="Duo">Duo (2 members)</option>
                  <option value="Trio">Trio (3 members)</option>
                  <option value="4 Members">4-Piece Band</option>
                  <option value="5+ Members">5+ Members Large Band</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="total_members">Total Band Members</Label>
                <Input id="total_members" type="number" {...register("total_members", { valueAsNumber: true })} />
                {errors.total_members && <p className="text-xs text-error font-medium">{errors.total_members.message}</p>}
              </div>
            </div>

            {/* Languages Tags Selector */}
            <div className="space-y-2">
              <Label>Languages Performed (Select multiple)</Label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_LANGUAGES.map((lang) => {
                  const isSelected = watchedLanguages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => handleLanguageToggle(lang)}
                      className={`h-9 px-4 rounded-full text-xs font-semibold border transition-all ${
                        isSelected 
                          ? "bg-primary border-primary text-white shadow-md shadow-primary/25 scale-105" 
                          : "bg-bg-elevated/40 border-border text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>
              {errors.languages && <p className="text-xs text-error font-medium">{errors.languages.message}</p>}
            </div>

            {/* Genres Tags Selector */}
            <div className="space-y-2">
              <Label>Music Genres (Select multiple)</Label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_GENRES.map((genre) => {
                  const isSelected = watchedGenres.includes(genre);
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => handleGenreToggle(genre)}
                      className={`h-9 px-4 rounded-full text-xs font-semibold border transition-all ${
                        isSelected 
                          ? "bg-primary border-primary text-white shadow-md shadow-primary/25 scale-105" 
                          : "bg-bg-elevated/40 border-border text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
              {errors.genres && <p className="text-xs text-error font-medium">{errors.genres.message}</p>}
            </div>
          </div>
        )}

        {/* STEP 4: PRICING */}
        {currentStep === 4 && (
          <div className="space-y-4 transition-all duration-300">
            <h2 className="text-xl font-bold text-text-primary">Step 4: Pricing & Travel Charges</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="base_rate">Starting Price (Hourly base rate)</Label>
                <div className="relative">
                  <Input id="base_rate" type="number" placeholder="E.g. 15000" {...register("base_rate", { valueAsNumber: true })} />
                  <span className="absolute right-3 top-2.5 text-xs text-text-muted font-bold">INR</span>
                </div>
                {errors.base_rate && <p className="text-xs text-error font-medium">{errors.base_rate.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="travel_radius">Max Travel Radius (km from base city)</Label>
                <Input id="travel_radius" type="number" placeholder="E.g. 100" {...register("travel_radius", { valueAsNumber: true })} />
                {errors.travel_radius && <p className="text-xs text-error font-medium">{errors.travel_radius.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="travel_charges">Travel Surcharge (Per extra km)</Label>
                <Input id="travel_charges" type="number" placeholder="E.g. 15" {...register("travel_charges", { valueAsNumber: true })} />
                {errors.travel_charges && <p className="text-xs text-error font-medium">{errors.travel_charges.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="min_booking_hours">Minimum Booking Hours</Label>
                <Input id="min_booking_hours" type="number" placeholder="E.g. 2" {...register("min_booking_hours", { valueAsNumber: true })} />
                {errors.min_booking_hours && <p className="text-xs text-error font-medium">{errors.min_booking_hours.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="max_booking_hours">Maximum Booking Hours</Label>
                <Input id="max_booking_hours" type="number" placeholder="E.g. 6" {...register("max_booking_hours", { valueAsNumber: true })} />
                {errors.max_booking_hours && <p className="text-xs text-error font-medium">{errors.max_booking_hours.message}</p>}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: EQUIPMENT */}
        {currentStep === 5 && (
          <div className="space-y-4 transition-all duration-300">
            <h2 className="text-xl font-bold text-text-primary">Step 5: Sound & Instruments Equipment</h2>
            <p className="text-xs text-text-secondary">Indicate what hardware you bring to gigs by default.</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              {Object.keys(watchedEquipment).map((key) => {
                const label = key.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
                const isSelected = !!watchedEquipment[key as keyof typeof watchedEquipment];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleEquipmentChange(key, !isSelected)}
                    className={`h-20 flex flex-col items-center justify-center gap-1.5 rounded-xl border text-sm font-semibold transition-all ${
                      isSelected
                        ? "bg-primary/10 border-primary text-primary shadow-sm"
                        : "bg-bg-elevated/20 border-border text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <span className="capitalize">{label}</span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${isSelected ? "text-primary" : "text-text-muted"}`}>
                      {isSelected ? "Included" : "N/A"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 6: MEDIA */}
        {currentStep === 6 && (
          <div className="space-y-6 transition-all duration-300">
            <h2 className="text-xl font-bold text-text-primary">Step 6: Media Gallery & Demo Links</h2>

            {/* Gallery Section */}
            <div className="space-y-3">
              <Label>Photos Showcase Gallery (Up to 4 images)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((idx) => {
                  const url = watchedGallery[idx] || "";
                  return (
                    <div key={idx} className="border border-border/80 rounded-2xl p-2 bg-bg-elevated/10">
                      <ImageUpload
                        value={url}
                        onChange={(newUrl) => {
                          const current = [...watchedGallery];
                          current[idx] = newUrl;
                          setValue("gallery", current.filter(Boolean));
                        }}
                        onRemove={() => {
                          const current = [...watchedGallery];
                          current.splice(idx, 1);
                          setValue("gallery", current.filter(Boolean));
                        }}
                        subfolder="artists/gallery"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Demo Video Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-3">
                <Label>Performance Demo Video (Sandbox upload file)</Label>
                <VideoUpload
                  value={watchedVideos[0] || ""}
                  onChange={(url) => setValue("videos", [url])}
                  onRemove={() => setValue("videos", [])}
                  subfolder="artists/videos"
                />
              </div>

              {/* YouTube Links Section */}
              <div className="space-y-3">
                <Label>YouTube Video Links</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="https://youtube.com/watch?v=..." 
                    value={newYoutubeLink}
                    onChange={(e) => setNewYoutubeLink(e.target.value)}
                  />
                  <Button type="button" onClick={addYoutubeLink} className="h-10 px-4 bg-primary text-white">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {watchedYoutubeLinks.map((link, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-bg-elevated/30">
                      <span className="text-xs text-text-secondary truncate max-w-[250px]">{link}</span>
                      <button type="button" onClick={() => removeYoutubeLink(idx)} className="text-error hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {watchedYoutubeLinks.length === 0 && (
                    <p className="text-xs text-text-muted italic">No external YouTube links added yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: AVAILABILITY */}
        {currentStep === 7 && (
          <div className="space-y-4 transition-all duration-300">
            <h2 className="text-xl font-bold text-text-primary">Step 7: Weekly Performance Schedule</h2>
            <p className="text-xs text-text-secondary">Toggle days and set standard hours you&apos;re open for bookings.</p>

            <div className="border border-border rounded-2xl divide-y divide-border overflow-hidden bg-bg-card/45">
              {Object.keys(watchedWeeklySchedule).map((day) => {
                const dayConfig = watchedWeeklySchedule[day] || { available: false, start: "09:00", end: "22:00" };
                return (
                  <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-3">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox"
                        id={`check-${day}`}
                        checked={dayConfig.available}
                        onChange={() => handleDayAvailabilityToggle(day)}
                        className="w-4.5 h-4.5 accent-primary rounded bg-bg-card border-border"
                      />
                      <label htmlFor={`check-${day}`} className={`text-sm font-semibold ${dayConfig.available ? "text-text-primary" : "text-text-muted"}`}>
                        {day}
                      </label>
                    </div>

                    {dayConfig.available && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-muted">Hours:</span>
                        <input
                          type="time"
                          value={dayConfig.start}
                          onChange={(e) => handleDayTimeChange(day, "start", e.target.value)}
                          className="h-8 px-2 text-xs rounded border border-border bg-bg-elevated text-text-primary focus:outline-none"
                        />
                        <span className="text-xs text-text-muted">to</span>
                        <input
                          type="time"
                          value={dayConfig.end}
                          onChange={(e) => handleDayTimeChange(day, "end", e.target.value)}
                          className="h-8 px-2 text-xs rounded border border-border bg-bg-elevated text-text-primary focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 8: TERMS */}
        {currentStep === 8 && (
          <div className="space-y-6 transition-all duration-300">
            <h2 className="text-xl font-bold text-text-primary">Step 8: Accept Terms & Submit Application</h2>

            <div className="p-4 bg-bg-elevated/30 border border-border rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck className="h-5 w-5" />
                <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider">Performer Platform Policy</h4>
              </div>
              <div className="text-xs text-text-secondary leading-relaxed max-h-56 overflow-y-auto pr-1 space-y-2">
                <p>By registering on BandConnect, you agree to the following marketplace covenants:</p>
                <ol className="list-decimal pl-5 space-y-1.5">
                  <li><strong>Authenticity:</strong> You warrant that all performance recordings, photos, and descriptions submitted represent your actual capabilities.</li>
                  <li><strong>Escrow Payments:</strong> All client bookings must be processed directly on the platform. Sidestepping escrow is a violation of service policy.</li>
                  <li><strong>Platform Commission:</strong> BandConnect retains a standard commission on completed bookings as outlined in platform settings.</li>
                  <li><strong>Cancellation Terms:</strong> Standard cancel timelines apply. Frequent non-emergencies cancel behavior leads to suspension.</li>
                </ol>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2.5">
                <input 
                  type="checkbox" 
                  id="acceptTerms" 
                  {...register("acceptTerms")}
                  className="w-5 h-5 accent-primary rounded bg-bg-card border-border mt-0.5"
                />
                <Label htmlFor="acceptTerms" className="text-xs text-text-secondary cursor-pointer leading-normal">
                  I have read and agree to all the terms and marketplace provider covenants stated above.
                </Label>
              </div>
              {errors.acceptTerms && <p className="text-xs text-error font-medium mt-1">{errors.acceptTerms.message}</p>}
            </div>
          </div>
        )}

        {/* FOOTER ACTIONS */}
        <div className="flex items-center justify-between border-t border-border/80 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 1 || isSubmitting}
            className="flex items-center gap-1.5 h-10"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>

          {currentStep < STEPS.length ? (
            <Button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 h-10 bg-primary hover:bg-primary/95 text-white"
            >
              <span>Continue</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 h-10 bg-primary hover:bg-primary/95 text-white font-bold"
            >
              {isSubmitting ? "Submitting Request..." : "Submit Registration"}
            </Button>
          )}
        </div>

      </form>
    </div>
  );
}
