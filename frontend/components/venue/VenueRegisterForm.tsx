"use client";

import * as React from "react";
import { useForm, Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  ShieldCheck,
  Building2,
  MapPin,
  Users,
  DollarSign,
  Image as ImageIcon,
  Clock,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { venueRegisterSchema, VenueRegisterFormData } from "@/utils/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ProgressStepper } from "@/components/ui/progress-stepper";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { VideoUpload } from "@/components/shared/VideoUpload";
import { venueService } from "@/services/venueService";
import { api } from "@/services/api";
import toast from "react-hot-toast";

const STEPS = [
  "Account",
  "Owner Info",
  "Venue Specs",
  "Location",
  "Facilities",
  "Capacity",
  "Pricing",
  "Media",
  "Availability",
  "Review & Submit"
];

const VENUE_TYPES = [
  "Marriage Hall",
  "Resort",
  "Hotel",
  "Banquet Hall",
  "Farm House",
  "Open Ground",
  "Club",
  "Pub",
  "Restaurant",
  "Others"
];

const FACILITY_OPTIONS = [
  { id: "parking", label: "Parking Space" },
  { id: "ac", label: "Air Conditioning" },
  { id: "stage", label: "Elevated Stage" },
  { id: "green_room", label: "Green Room / Makeup Space" },
  { id: "sound_system", label: "In-house Sound System" },
  { id: "lighting", label: "Pro stage Lighting" },
  { id: "generator", label: "Backup Generator" },
  { id: "wifi", label: "Guest WiFi" },
  { id: "dining", label: "Dining Hall" },
  { id: "rooms", label: "Guest Rooms" }
];

export function VenueRegisterForm() {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSuccess, setIsSuccess] = React.useState(false);

  interface LocationItem {
    id: string | number;
    name: string;
  }

  // Locations states
  const [countries, setCountries] = React.useState<LocationItem[]>([]);
  const [states, setStates] = React.useState<LocationItem[]>([]);
  const [cities, setCities] = React.useState<LocationItem[]>([]);

  const [loadingLocations, setLoadingLocations] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting }
  } = useForm<VenueRegisterFormData>({
    resolver: zodResolver(venueRegisterSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
      owner_name: "",
      business_name: "",
      contact_details: "",
      venue_name: "",
      venue_type: "Banquet Hall",
      description: "",
      country: "",
      state: "",
      city_id: "",
      address: "",
      google_map_location: "",
      pincode: "",
      facilities: [],
      min_capacity: 50,
      max_capacity: 500,
      base_price: 0,
      hourly_price: 0,
      extra_charges: 0,
      security_deposit: 0,
      images: [],
      videos: [],
      virtual_tour: "",
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
      blocked_dates: [],
      acceptTerms: false
    }
  });

  const watchedFacilities = watch("facilities") || [];
  const watchedImages = watch("images") || [];
  const watchedVideos = watch("videos") || [];
  const watchedWeeklySchedule = watch("weekly_schedule") || {};

  React.useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await api.get("/locations/countries");
        setCountries(res.data?.data || []);
      } catch (err) {
        console.error("Failed to load countries", err);
      }
    };
    fetchCountries();
  }, []);

  const handleCountryChange = async (countryName: string) => {
    setValue("country", countryName);
    setValue("state", "");
    setValue("city_id", "");
    setStates([]);
    setCities([]);

    const selectedCountry = countries.find(c => c.name === countryName);
    if (!selectedCountry) return;

    setLoadingLocations(true);
    try {
      const res = await api.get(`/locations/states?country_id=${selectedCountry.id}`);
      setStates(res.data?.data || []);
    } catch {
      toast.error("Failed to fetch states list.");
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleStateChange = async (stateName: string) => {
    setValue("state", stateName);
    setValue("city_id", "");
    setCities([]);

    const selectedState = states.find(s => s.name === stateName);
    if (!selectedState) return;

    setLoadingLocations(true);
    try {
      const res = await api.get(`/locations/cities?state_id=${selectedState.id}`);
      setCities(res.data?.data || []);
    } catch {
      toast.error("Failed to fetch cities list.");
    } finally {
      setLoadingLocations(false);
    }
  };

  // Step Navigations
  const handleNext = async () => {
    let fieldsToValidate: Path<VenueRegisterFormData>[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ["email", "mobile", "password", "confirmPassword"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["owner_name", "business_name", "contact_details"];
    } else if (currentStep === 3) {
      fieldsToValidate = ["venue_name", "venue_type", "description"];
    } else if (currentStep === 4) {
      fieldsToValidate = ["country", "state", "city_id", "address", "pincode"];
    } else if (currentStep === 5) {
      fieldsToValidate = ["facilities"];
    } else if (currentStep === 6) {
      fieldsToValidate = ["min_capacity", "max_capacity"];
    } else if (currentStep === 7) {
      fieldsToValidate = ["base_price", "hourly_price", "extra_charges", "security_deposit"];
    } else if (currentStep === 8) {
      fieldsToValidate = ["images", "videos", "virtual_tour"];
    } else if (currentStep === 9) {
      fieldsToValidate = ["weekly_schedule", "holidays", "blocked_dates"];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    } else {
      toast.error("Please fill in all required fields correctly.");
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Submit Handler
  const onSubmit = async (values: VenueRegisterFormData) => {
    try {
      await venueService.register(values);
      setIsSuccess(true);
      toast.success("Venue onboarding request submitted successfully!");
    } catch (err) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      const msg = error.response?.data?.error?.message || "Failed to onboard venue. Please check details.";
      toast.error(msg);
    }
  };

  const toggleFacility = (id: string) => {
    if (watchedFacilities.includes(id)) {
      setValue("facilities", watchedFacilities.filter(f => f !== id));
    } else {
      setValue("facilities", [...watchedFacilities, id]);
    }
  };

  if (isSuccess) {
    return (
      <Card className="max-w-2xl mx-auto bg-bg-card/45 backdrop-blur-md border border-border/80 p-8 rounded-3xl shadow-2xl text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </div>
        </div>
        <h2 className="text-2xl font-black text-white">Registration Application Submitted!</h2>
        <p className="text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
          Thank you for registering your venue. Our administrative audit team is reviewing your profile specs, facilities, and location. You will receive an email activation note once your profile verification changes status to Approved.
        </p>
        <div className="pt-4">
          <Button onClick={() => window.location.href = "/"} className="bg-primary hover:bg-primary-dark text-white font-bold px-8 h-11">
            Back to Home
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Visual Stepper Progress Bar */}
      <Card className="bg-bg-card/45 backdrop-blur-md border border-border/80 p-6 rounded-2xl shadow-xl">
        <ProgressStepper currentStep={currentStep} steps={STEPS} />
      </Card>

      {/* Main Form content wrapper */}
      <Card className="bg-bg-card/45 backdrop-blur-md border border-border/80 p-6 sm:p-8 rounded-3xl shadow-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* STEP 1: ACCOUNT DETAILS */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Setup Owner Credentials
              </h3>
              <p className="text-xs text-text-secondary">Please configure your admin login email credentials.</p>
              
              <div className="space-y-1.5">
                <Label htmlFor="reg_email">Email address</Label>
                <Input id="reg_email" type="email" placeholder="owner@venue.com" {...register("email")} />
                {errors.email && <span className="text-xs text-error flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.email.message}</span>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg_mobile">Contact Mobile Number</Label>
                <Input id="reg_mobile" placeholder="E.g. +919876543210" {...register("mobile")} />
                {errors.mobile && <span className="text-xs text-error flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.mobile.message}</span>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reg_password">Password</Label>
                  <Input id="reg_password" type="password" placeholder="Min 8 characters..." {...register("password")} />
                  {errors.password && <span className="text-xs text-error flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.password.message}</span>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg_confirmPassword">Confirm Password</Label>
                  <Input id="reg_confirmPassword" type="password" placeholder="Confirm password..." {...register("confirmPassword")} />
                  {errors.confirmPassword && <span className="text-xs text-error flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.confirmPassword.message}</span>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: OWNER INFO */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-white">Owner Details</h3>
              <p className="text-xs text-text-secondary">Provide profile properties for the primary business contact.</p>

              <div className="space-y-1.5">
                <Label htmlFor="reg_owner_name">Owner Name</Label>
                <Input id="reg_owner_name" placeholder="John Doe" {...register("owner_name")} />
                {errors.owner_name && <span className="text-xs text-error flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.owner_name.message}</span>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg_business_name">Business/Company Name</Label>
                <Input id="reg_business_name" placeholder="Grand Venues Pvt Ltd" {...register("business_name")} />
                {errors.business_name && <span className="text-xs text-error flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.business_name.message}</span>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg_contact_details">Alternate Contact Phone / Email (Optional)</Label>
                <Input id="reg_contact_details" placeholder="Alternate phone, notes..." {...register("contact_details")} />
              </div>
            </div>
          )}

          {/* STEP 3: VENUE SPECS */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" /> Venue details
              </h3>
              <p className="text-xs text-text-secondary">Describe your space highlights and category types.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reg_venue_name">Venue Name</Label>
                  <Input id="reg_venue_name" placeholder="Grand Royal Palace Banquet" {...register("venue_name")} />
                  {errors.venue_name && <span className="text-xs text-error flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.venue_name.message}</span>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg_venue_type">Venue Category Type</Label>
                  <select
                    id="reg_venue_type"
                    {...register("venue_type")}
                    className="flex h-10 w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-xs text-white"
                  >
                    {VENUE_TYPES.map(vt => (
                      <option key={vt} value={vt}>{vt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg_description">Description / Bio</Label>
                <Textarea id="reg_description" rows={5} placeholder="Describe stage sizes, location highlights, setup structures, parking, catering arrangements..." {...register("description")} />
              </div>
            </div>
          )}

          {/* STEP 4: LOCATION */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> Venue Location Coordinates
              </h3>
              <p className="text-xs text-text-secondary">Specify where your space is situated for client directions.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reg_country">Country</Label>
                  <select
                    id="reg_country"
                    onChange={(e) => handleCountryChange(e.target.value)}
                    value={watch("country") || ""}
                    className="flex h-10 w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-xs text-white"
                  >
                    <option value="">Select Country</option>
                    {countries.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg_state">State</Label>
                  <select
                    id="reg_state"
                    disabled={!watch("country") || loadingLocations}
                    onChange={(e) => handleStateChange(e.target.value)}
                    value={watch("state") || ""}
                    className="flex h-10 w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-xs text-white"
                  >
                    <option value="">Select State</option>
                    {states.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg_city">City</Label>
                  <select
                    id="reg_city"
                    disabled={!watch("state") || loadingLocations}
                    {...register("city_id")}
                    className="flex h-10 w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-xs text-white"
                  >
                    <option value="">Select City</option>
                    {cities.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg_address">Street Address</Label>
                <Input id="reg_address" placeholder="Door No, Street Name, Landmark..." {...register("address")} />
                {errors.address && <span className="text-xs text-error flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.address.message}</span>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reg_pincode">Pincode / Postal Code</Label>
                  <Input id="reg_pincode" placeholder="E.g. 600001" {...register("pincode")} />
                  {errors.pincode && <span className="text-xs text-error flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.pincode.message}</span>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg_google_map">Google Map Coordinates Link (Optional)</Label>
                  <Input id="reg_google_map" placeholder="https://maps.google.com/..." {...register("google_map_location")} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: FACILITIES */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-white">Included Facilities</h3>
              <p className="text-xs text-text-secondary">Mark checking flags for all amenities currently available at the venue space.</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                {FACILITY_OPTIONS.map(f => {
                  const checked = watchedFacilities.includes(f.id);
                  return (
                    <div 
                      key={f.id}
                      onClick={() => toggleFacility(f.id)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border border-border/80 cursor-pointer transition-all ${checked ? "bg-primary/10 border-primary text-white" : "bg-bg-elevated/5 hover:bg-bg-elevated/10 text-text-muted"}`}
                    >
                      <input 
                        type="checkbox" 
                        checked={checked}
                        onChange={() => {}} // handled by div click
                        className="rounded border-border text-primary focus:ring-primary h-4.5 w-4.5"
                      />
                      <span className="text-xs font-semibold leading-none">{f.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: CAPACITY */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Guest Capacity Metrics
              </h3>
              <p className="text-xs text-text-secondary">Determine crowd constraints permitted under local zoning rules.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reg_min_capacity">Minimum Guests Count</Label>
                  <Input 
                    id="reg_min_capacity" 
                    type="number"
                    {...register("min_capacity", { valueAsNumber: true })}
                  />
                  {errors.min_capacity && <span className="text-xs text-error flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.min_capacity.message}</span>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg_max_capacity">Maximum Guests Capacity Limit</Label>
                  <Input 
                    id="reg_max_capacity" 
                    type="number"
                    {...register("max_capacity", { valueAsNumber: true })}
                  />
                  {errors.max_capacity && <span className="text-xs text-error flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.max_capacity.message}</span>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: PRICING */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" /> Pricing & Deposit Settings
              </h3>
              <p className="text-xs text-text-secondary">Define rental base tariffs, hourly options and caution security figures.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reg_base_price">Base Daily Rent Price (INR)</Label>
                  <Input 
                    id="reg_base_price" 
                    type="number"
                    placeholder="E.g. 50000"
                    {...register("base_price", { valueAsNumber: true })}
                  />
                  {errors.base_price && <span className="text-xs text-error flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.base_price.message}</span>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg_hourly_price">Hourly Booking Rate (INR)</Label>
                  <Input 
                    id="reg_hourly_price" 
                    type="number"
                    placeholder="E.g. 5000"
                    {...register("hourly_price", { valueAsNumber: true })}
                  />
                  {errors.hourly_price && <span className="text-xs text-error flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.hourly_price.message}</span>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg_extra_charges">Extra Clean/Utility Charges (INR)</Label>
                  <Input 
                    id="reg_extra_charges" 
                    type="number"
                    placeholder="E.g. 2000"
                    {...register("extra_charges", { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg_security_deposit">Refundable Security Deposit (INR)</Label>
                  <Input 
                    id="reg_security_deposit" 
                    type="number"
                    placeholder="E.g. 15000"
                    {...register("security_deposit", { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: MEDIA GALLERY */}
          {currentStep === 8 && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" /> Gallery Showcase Uploads
              </h3>
              <p className="text-xs text-text-secondary">Upload high-resolution shots and links to virtual 3D tour platforms.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>Venue Showcase Images (Up to 4)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[0, 1, 2, 3].map((idx) => {
                      const url = watchedImages[idx] || "";
                      return (
                        <div key={idx} className="border border-border/80 rounded-2xl p-2 bg-bg-elevated/10">
                          <ImageUpload
                            value={url}
                            onChange={(newUrl) => {
                              const current = [...watchedImages];
                              current[idx] = newUrl;
                              setValue("images", current.filter(Boolean));
                            }}
                            onRemove={() => {
                              const current = [...watchedImages];
                              current.splice(idx, 1);
                              setValue("images", current.filter(Boolean));
                            }}
                            subfolder="venues/images"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Walkthrough Video Clip</Label>
                  <VideoUpload 
                    value={watchedVideos[0] || ""}
                    onChange={(url) => setValue("videos", [url])}
                    onRemove={() => setValue("videos", [])}
                    subfolder="venues/videos"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <Label htmlFor="reg_virtual_tour">Virtual 3D Tour URL (Optional)</Label>
                <Input id="reg_virtual_tour" placeholder="https://matterport.com/show/?m=..." {...register("virtual_tour")} />
              </div>
            </div>
          )}

          {/* STEP 9: AVAILABILITY RULES */}
          {currentStep === 9 && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> Working Hours Calendar Settings
              </h3>
              <p className="text-xs text-text-secondary">Configure available slots timings and blocked holidays calendar lists.</p>

              <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-2">
                {Object.keys(watchedWeeklySchedule).map(day => {
                  const dayData = watchedWeeklySchedule[day];
                  return (
                    <div key={day} className="flex items-center justify-between gap-4 p-2.5 border border-border/40 rounded-xl">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox"
                          checked={dayData.available}
                          onChange={(e) => {
                            setValue(`weekly_schedule.${day}.available`, e.target.checked);
                          }}
                          className="rounded border-border text-primary h-4.5 w-4.5"
                        />
                        <span className="text-xs font-bold text-white w-20 capitalize">{day}</span>
                      </div>

                      {dayData.available ? (
                        <div className="flex items-center gap-2 text-xs">
                          <input 
                            type="time" 
                            value={dayData.start}
                            onChange={(e) => setValue(`weekly_schedule.${day}.start`, e.target.value)}
                            className="bg-bg-card border border-border rounded px-2 py-1 text-white"
                          />
                          <span className="text-text-muted">to</span>
                          <input 
                            type="time" 
                            value={dayData.end}
                            onChange={(e) => setValue(`weekly_schedule.${day}.end`, e.target.value)}
                            className="bg-bg-card border border-border rounded px-2 py-1 text-white"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-text-muted italic">Closed / Holiday</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 10: TERMS & REVIEW */}
          {currentStep === 10 && (
            <div className="space-y-6">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <ShieldCheck className="h-5.5 w-5.5 text-primary" /> Onboarding Terms Approval
              </h3>
              
              <div className="bg-bg-elevated/10 border border-border/80 p-5 rounded-2xl space-y-4 max-h-[40vh] overflow-y-auto text-xs text-text-secondary leading-relaxed">
                <h4 className="font-extrabold text-white">Terms of Platform Listing</h4>
                <p>
                  1. Venue owners must declare authentic pricing details, capacity restrictions and coordinate metrics. Overcharging is strictly prohibited.
                </p>
                <p>
                  2. All booking cancellations, security deposits refunding processes and scheduling conflicts resolution tasks must follow the terms established on the user host dashboard.
                </p>
                <p>
                  3. The platform keeps 10% commission of base hourly/daily booking transactions. Payouts are dispatched to verified bank accounts post-event execution.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <input 
                  id="reg_terms"
                  type="checkbox" 
                  {...register("acceptTerms")}
                  className="rounded border-border text-primary h-5 w-5 cursor-pointer"
                />
                <Label htmlFor="reg_terms" className="cursor-pointer text-xs font-bold text-white selection:bg-transparent">
                  I accept the Terms of Service & commission policies.
                </Label>
              </div>
              {errors.acceptTerms && <span className="text-xs text-error flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.acceptTerms.message}</span>}
            </div>
          )}

          {/* Bottom control buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-border/50">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" onClick={handleBack} className="h-10 text-xs">
                <ChevronLeft className="h-4 w-4 mr-1.5" /> Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < STEPS.length ? (
              <Button type="button" onClick={handleNext} className="bg-primary hover:bg-primary/90 text-white font-bold h-10 text-xs px-6">
                Next Step <ChevronRight className="h-4 w-4 ml-1.5" />
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary-dark text-white font-bold h-10 text-xs px-8"
              >
                {isSubmitting ? "Submitting Request..." : "Accept & Onboard Venue"}
              </Button>
            )}
          </div>

        </form>
      </Card>
    </div>
  );
}
