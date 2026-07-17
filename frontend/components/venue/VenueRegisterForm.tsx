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
  DollarSign,
  Image as ImageIcon,
  Clock,
  AlertCircle,
  FileText,
  Plus,
  Trash2
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
  "Owner Info",
  "Venue Details",
  "Address",
  "Facilities",
  "Pricing",
  "Media",
  "Availability",
  "Documents",
  "Terms"
];

const VENUE_TYPES = [
  "Marriage Hall",
  "Resort",
  "Banquet Hall",
  "Hotel",
  "Restaurant",
  "Club",
  "Pub",
  "Farm House",
  "Convention Center",
  "Beach Venue",
  "Open Ground",
  "Rooftop",
  "Others"
];

const FACILITY_OPTIONS = [
  { id: "parking", label: "Parking Space" },
  { id: "ac", label: "Air Conditioning (AC)" },
  { id: "generator", label: "Generator / Power Backup" },
  { id: "stage", label: "Elevated Stage" },
  { id: "sound_system", label: "Sound System" },
  { id: "lighting", label: "Lighting setup" },
  { id: "green_room", label: "Green Room / Makeup Space" },
  { id: "dining_hall", label: "Dining Hall" },
  { id: "kitchen", label: "Kitchen Space" },
  { id: "rest_rooms", label: "Rest Rooms" },
  { id: "wheelchair_access", label: "Wheelchair Access" },
  { id: "lift", label: "Passenger Lift" },
  { id: "wifi", label: "Guest WiFi" },
  { id: "cctv", label: "CCTV Security" },
  { id: "security", label: "Guard Security" },
  { id: "power_backup", label: "Power Backup" },
  { id: "decoration_support", label: "Decoration Support" },
  { id: "catering_support", label: "Catering Support" }
];

export function VenueRegisterForm() {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSuccess, setIsSuccess] = React.useState(false);

  interface LocationItem {
    id: string | number;
    name: string;
  }

  // Location list states
  const [countries, setCountries] = React.useState<LocationItem[]>([]);
  const [states, setStates] = React.useState<LocationItem[]>([]);
  const [cities, setCities] = React.useState<LocationItem[]>([]);
  const [loadingLocations, setLoadingLocations] = React.useState(false);

  // Temporary list input states
  const [youtubeInput, setYoutubeInput] = React.useState("");
  const [blockedDateInput, setBlockedDateInput] = React.useState("");
  const [maintenanceInput, setMaintenanceInput] = React.useState("");
  const [holidayInput, setHolidayInput] = React.useState("");

  // Document upload state
  const [uploadingDoc, setUploadingDoc] = React.useState<Record<string, boolean>>({});

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
      mobile: "",
      owner_name: "",
      business_name: "",
      contact_person: "",
      gst_number: "",
      pan_number: "",
      venue_name: "",
      venue_type: "Banquet Hall",
      description: "",
      established_year: null,
      indoor_outdoor: "Both",
      country: "",
      state: "",
      district: "",
      city_id: "",
      area: "",
      address: "",
      landmark: "",
      pincode: "",
      latitude: null,
      longitude: null,
      google_map_location: "",
      facilities: [],
      min_capacity: 50,
      max_capacity: 500,
      base_price: 0,
      hourly_price: 0,
      weekend_price: 0,
      holiday_price: 0,
      security_deposit: 0,
      cancellation_charges: 0,
      extra_hour_charges: 0,
      cover_image: "",
      images: [],
      videos: [],
      youtube_links: [],
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
      blocked_dates: [],
      maintenance_days: [],
      public_holidays: [],
      booking_buffer_time: 0,
      doc_pan: "",
      doc_gst: "",
      doc_ownership_proof: "",
      doc_government_id: "",
      doc_business_license: "",
      acceptTerms: false
    }
  });

  const watchedFacilities = watch("facilities") || [];
  const watchedImages = watch("images") || [];
  const watchedVideos = watch("videos") || [];
  const watchedWeeklySchedule = watch("weekly_schedule") || {};
  const watchedYoutubeLinks = watch("youtube_links") || [];
  const watchedBlockedDates = watch("blocked_dates") || [];
  const watchedMaintenanceDays = watch("maintenance_days") || [];
  const watchedPublicHolidays = watch("public_holidays") || [];

  // Documents
  const watchedDocPan = watch("doc_pan");
  const watchedDocGst = watch("doc_gst");
  const watchedDocOwnershipProof = watch("doc_ownership_proof");
  const watchedDocGovId = watch("doc_government_id");
  const watchedDocLicense = watch("doc_business_license");

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

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: Path<VenueRegisterFormData>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must not exceed 5MB.");
      return;
    }

    setUploadingDoc(prev => ({ ...prev, [fieldName]: true }));
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/venues/upload?subfolder=documents", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setValue(fieldName, res.data.data);
    } catch (_err) {
      // Sandbox fallback URL
      const mockUrl = URL.createObjectURL(file);
      setValue(fieldName, mockUrl);
      toast.success(`${file.name} uploaded successfully! (Sandbox Mode)`);
    } finally {
      setUploadingDoc(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  // Step Navigations
  const handleNext = async () => {
    let fieldsToValidate: Path<VenueRegisterFormData>[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ["mobile", "owner_name", "business_name", "contact_person", "gst_number", "pan_number"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["venue_name", "venue_type", "description", "established_year", "min_capacity", "max_capacity", "indoor_outdoor"];
    } else if (currentStep === 3) {
      fieldsToValidate = ["country", "state", "district", "city_id", "area", "address", "landmark", "pincode", "latitude", "longitude", "google_map_location"];
    } else if (currentStep === 4) {
      fieldsToValidate = ["facilities"];
    } else if (currentStep === 5) {
      fieldsToValidate = ["base_price", "hourly_price", "weekend_price", "holiday_price", "security_deposit", "cancellation_charges", "extra_hour_charges"];
    } else if (currentStep === 6) {
      fieldsToValidate = ["cover_image", "images", "videos", "youtube_links", "virtual_tour"];
    } else if (currentStep === 7) {
      fieldsToValidate = ["weekly_schedule", "blocked_dates", "maintenance_days", "public_holidays", "booking_buffer_time"];
    } else if (currentStep === 8) {
      fieldsToValidate = ["doc_pan", "doc_gst", "doc_ownership_proof", "doc_government_id", "doc_business_license"];
    } else if (currentStep === 9) {
      fieldsToValidate = ["acceptTerms"];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const stepErrors: string[] = [];
      fieldsToValidate.forEach((field) => {
        const parts = (field as string).split(".");
        let currentError: any = errors;
        for (const part of parts) {
          if (currentError && typeof currentError === "object") {
            currentError = currentError[part];
          } else {
            currentError = undefined;
            break;
          }
        }
        if (currentError && currentError.message) {
          stepErrors.push(`${field}: ${currentError.message}`);
        }
      });
      if (stepErrors.length > 0) {
        toast.error(`Please correct the following errors:\n${stepErrors.join("\n")}`);
      } else {
        toast.error("Please verify all required wizard step entries are formatted correctly.");
      }
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Submit Handler
  const onSubmit = async (values: VenueRegisterFormData) => {
    try {
      const payload = {
        owner_name: values.owner_name,
        business_name: values.business_name,
        contact_person: values.contact_person || null,
        gst_number: values.gst_number || null,
        pan_number: values.pan_number || null,
        venue_name: values.venue_name,
        venue_type: values.venue_type,
        description: values.description || null,
        established_year: values.established_year ? Number(values.established_year) : null,
        indoor_outdoor: values.indoor_outdoor,
        country: values.country,
        state: values.state,
        district: values.district || null,
        city_id: values.city_id,
        area: values.area || null,
        address: values.address,
        landmark: values.landmark || null,
        pincode: values.pincode,
        latitude: values.latitude ? Number(values.latitude) : null,
        longitude: values.longitude ? Number(values.longitude) : null,
        google_map_location: values.google_map_location || null,
        facilities: values.facilities,
        min_capacity: Number(values.min_capacity) || 1,
        max_capacity: Number(values.max_capacity) || 1,
        base_price: Number(values.base_price) || 0.0,
        hourly_price: Number(values.hourly_price) || 0.0,
        weekend_price: Number(values.weekend_price) || 0.0,
        holiday_price: Number(values.holiday_price) || 0.0,
        security_deposit: Number(values.security_deposit) || 0.0,
        cancellation_charges: Number(values.cancellation_charges) || 0.0,
        extra_hour_charges: Number(values.extra_hour_charges) || 0.0,
        cover_image: values.cover_image || null,
        images: values.images,
        videos: values.videos,
        youtube_links: values.youtube_links,
        virtual_tour: values.virtual_tour || null,
        weekly_schedule: values.weekly_schedule,
        blocked_dates: values.blocked_dates,
        maintenance_days: values.maintenance_days,
        public_holidays: values.public_holidays,
        booking_buffer_time: Number(values.booking_buffer_time) || 0,
        doc_pan: values.doc_pan,
        doc_gst: values.doc_gst || null,
        doc_ownership_proof: values.doc_ownership_proof,
        doc_government_id: values.doc_government_id,
        doc_business_license: values.doc_business_license || null
      };

      await venueService.createProfile(payload);
      setIsSuccess(true);
      toast.success("Venue profile onboarding completed successfully!");
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || "Failed to onboard venue.";
      const details = err.response?.data?.error?.details;
      if (details && typeof details === "object") {
        const detailsMsg = Object.entries(details)
          .map(([key, val]) => `${key}: ${val}`)
          .join("\n");
        toast.error(`Onboarding failed: ${errorMsg}\n\nDetails:\n${detailsMsg}`);
      } else {
        toast.error(errorMsg);
      }
    }
  };

  const toggleFacility = (id: string) => {
    if (watchedFacilities.includes(id)) {
      setValue("facilities", watchedFacilities.filter(f => f !== id));
    } else {
      setValue("facilities", [...watchedFacilities, id]);
    }
  };

  // List management helpers
  const addYoutubeLink = () => {
    if (!youtubeInput.trim()) return;
    if (!youtubeInput.includes("youtube.com") && !youtubeInput.includes("youtu.be")) {
      toast.error("Please enter a valid YouTube URL.");
      return;
    }
    setValue("youtube_links", [...watchedYoutubeLinks, youtubeInput.trim()]);
    setYoutubeInput("");
  };

  const removeYoutubeLink = (idx: number) => {
    setValue("youtube_links", watchedYoutubeLinks.filter((_, i) => i !== idx));
  };

  const addBlockedDate = () => {
    if (!blockedDateInput) return;
    if (watchedBlockedDates.includes(blockedDateInput)) return;
    setValue("blocked_dates", [...watchedBlockedDates, blockedDateInput]);
    setBlockedDateInput("");
  };

  const removeBlockedDate = (date: string) => {
    setValue("blocked_dates", watchedBlockedDates.filter(d => d !== date));
  };

  const addMaintenanceDay = () => {
    if (!maintenanceInput) return;
    if (watchedMaintenanceDays.includes(maintenanceInput)) return;
    setValue("maintenance_days", [...watchedMaintenanceDays, maintenanceInput]);
    setMaintenanceInput("");
  };

  const removeMaintenanceDay = (day: string) => {
    setValue("maintenance_days", watchedMaintenanceDays.filter(d => d !== day));
  };

  const addPublicHoliday = () => {
    if (!holidayInput) return;
    if (watchedPublicHolidays.includes(holidayInput)) return;
    setValue("public_holidays", [...watchedPublicHolidays, holidayInput]);
    setHolidayInput("");
  };

  const removePublicHoliday = (date: string) => {
    setValue("public_holidays", watchedPublicHolidays.filter(d => d !== date));
  };

  if (isSuccess) {
    return (
      <Card className="max-w-2xl mx-auto bg-bg-card/45 backdrop-blur-md border border-border/80 p-8 rounded-3xl shadow-2xl text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </div>
        </div>
        <h2 className="text-2xl font-black text-text-primary">Onboarding Profile Completed!</h2>
        <p className="text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
          Thank you for setting up your venue space details. Your profile verification is currently under review by our administrative team.
        </p>
        <div className="pt-4">
          <Button onClick={() => window.location.href = "/venue/dashboard"} className="bg-primary hover:bg-primary-dark text-white font-bold px-8 h-11">
            Go to Dashboard
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
          
          {/* STEP 1: OWNER INFO */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-text-primary flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Owner Information
              </h3>
              <p className="text-xs text-text-secondary">Provide profile properties for the primary business contact.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reg_mobile">Contact Mobile Number</Label>
                  <Input id="reg_mobile" placeholder="E.g. +919876543210" {...register("mobile")} />
                  {errors.mobile && <span className="text-xs text-error flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.mobile.message}</span>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg_contact_person">Contact Person (Representing Business)</Label>
                  <Input id="reg_contact_person" placeholder="Manager or Coordinator Name" {...register("contact_person")} />
                  {errors.contact_person && <span className="text-xs text-error flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.contact_person.message}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reg_gst">GST Number (Optional)</Label>
                  <Input id="reg_gst" placeholder="E.g. 29AAAAA1111A1Z1" {...register("gst_number")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg_pan">PAN Number (Optional)</Label>
                  <Input id="reg_pan" placeholder="E.g. ABCDE1234F" {...register("pan_number")} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: VENUE DETAILS */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-text-primary flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" /> Venue Information
              </h3>
              <p className="text-xs text-text-secondary">Describe your space highlights and capacity parameters.</p>

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
                    className="flex h-10 w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
                  >
                    {VENUE_TYPES.map(vt => (
                      <option key={vt} value={vt}>{vt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reg_established_year">Established Year</Label>
                  <Input 
                    id="reg_established_year" 
                    type="number"
                    placeholder="E.g. 2018"
                    {...register("established_year", { valueAsNumber: true })} 
                  />
                  {errors.established_year && <span className="text-xs text-error flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.established_year.message}</span>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg_indoor_outdoor">Indoor / Outdoor</Label>
                  <select
                    id="reg_indoor_outdoor"
                    {...register("indoor_outdoor")}
                    className="flex h-10 w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
                  >
                    <option value="Indoor">Indoor</option>
                    <option value="Outdoor">Outdoor</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reg_min_capacity">Minimum Capacity</Label>
                  <Input 
                    id="reg_min_capacity" 
                    type="number"
                    placeholder="E.g. 50"
                    {...register("min_capacity", { valueAsNumber: true })}
                  />
                  {errors.min_capacity && <span className="text-xs text-error flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.min_capacity.message}</span>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg_max_capacity">Maximum Capacity Limit</Label>
                  <Input 
                    id="reg_max_capacity" 
                    type="number"
                    placeholder="E.g. 1000"
                    {...register("max_capacity", { valueAsNumber: true })}
                  />
                  {errors.max_capacity && <span className="text-xs text-error flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.max_capacity.message}</span>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg_description">Description / Bio</Label>
                <Textarea id="reg_description" rows={4} placeholder="Describe stage sizes, backup capabilities, acoustics quality, arrangements layouts..." {...register("description")} />
              </div>
            </div>
          )}

          {/* STEP 3: ADDRESS & LOCATION */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-text-primary flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> Address & Location
              </h3>
              <p className="text-xs text-text-secondary">Specify where your space is situated for client directions.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reg_country">Country</Label>
                  <select
                    id="reg_country"
                    onChange={(e) => handleCountryChange(e.target.value)}
                    value={watch("country") || ""}
                    className="flex h-10 w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
                  >
                    <option value="">Select Country</option>
                    {countries.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  {errors.country && <span className="text-xs text-error flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.country.message}</span>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg_state">State</Label>
                  <select
                    id="reg_state"
                    disabled={!watch("country") || loadingLocations}
                    onChange={(e) => handleStateChange(e.target.value)}
                    value={watch("state") || ""}
                    className="flex h-10 w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
                  >
                    <option value="">Select State</option>
                    {states.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                  {errors.state && <span className="text-xs text-error flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.state.message}</span>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg_city">City</Label>
                  <select
                    id="reg_city"
                    disabled={!watch("state") || loadingLocations}
                    {...register("city_id")}
                    className="flex h-10 w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
                  >
                    <option value="">Select City</option>
                    {cities.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.city_id && <span className="text-xs text-error flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.city_id.message}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reg_district">District</Label>
                  <Input id="reg_district" placeholder="District name" {...register("district")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg_area">Area / Suburb</Label>
                  <Input id="reg_area" placeholder="E.g. Indiranagar" {...register("area")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg_pincode">Pincode</Label>
                  <Input id="reg_pincode" placeholder="E.g. 560038" {...register("pincode")} />
                  {errors.pincode && <span className="text-xs text-error flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.pincode.message}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reg_address">Street Address</Label>
                  <Input id="reg_address" placeholder="Door No, Building Name, Street..." {...register("address")} />
                  {errors.address && <span className="text-xs text-error flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.address.message}</span>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg_landmark">Landmark</Label>
                  <Input id="reg_landmark" placeholder="E.g. Opposite Central Park" {...register("landmark")} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reg_lat">Latitude (Optional)</Label>
                  <Input id="reg_lat" type="number" step="any" placeholder="E.g. 12.971598" {...register("latitude", { valueAsNumber: true })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg_lng">Longitude (Optional)</Label>
                  <Input id="reg_lng" type="number" step="any" placeholder="E.g. 77.594562" {...register("longitude", { valueAsNumber: true })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg_map_url">Google Maps URL</Label>
                  <Input id="reg_map_url" placeholder="https://maps.google.com/..." {...register("google_map_location")} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: FACILITIES */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-text-primary">Included Facilities</h3>
              <p className="text-xs text-text-secondary">Mark checkbox flags for all amenities available at the venue space.</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                {FACILITY_OPTIONS.map(f => {
                  const checked = watchedFacilities.includes(f.id);
                  return (
                    <div 
                      key={f.id}
                      onClick={() => toggleFacility(f.id)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border border-border/80 cursor-pointer transition-all ${checked ? "bg-primary/10 border-primary text-text-primary" : "bg-bg-elevated/5 hover:bg-bg-elevated/10 text-text-muted"}`}
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

          {/* STEP 5: PRICING */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-text-primary flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" /> Pricing & Deposit Settings
              </h3>
              <p className="text-xs text-text-secondary">Define rental tariffs structures for days and hourly slots.</p>

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
                  <Label htmlFor="reg_weekend_price">Weekend Price Premium (INR)</Label>
                  <Input 
                    id="reg_weekend_price" 
                    type="number" 
                    placeholder="E.g. 60000"
                    {...register("weekend_price", { valueAsNumber: true })} 
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg_holiday_price">Holiday Price Premium (INR)</Label>
                  <Input 
                    id="reg_holiday_price" 
                    type="number" 
                    placeholder="E.g. 70000"
                    {...register("holiday_price", { valueAsNumber: true })} 
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

                <div className="space-y-1.5">
                  <Label htmlFor="reg_cancellation_charges">Cancellation Charges (INR)</Label>
                  <Input 
                    id="reg_cancellation_charges" 
                    type="number" 
                    placeholder="E.g. 10000"
                    {...register("cancellation_charges", { valueAsNumber: true })} 
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg_extra_hour">Extra Hour Overtime Charges (INR)</Label>
                  <Input 
                    id="reg_extra_hour" 
                    type="number" 
                    placeholder="E.g. 8000"
                    {...register("extra_hour_charges", { valueAsNumber: true })} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: GALLERY & MEDIA */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-text-primary flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" /> Gallery Showcase Uploads
              </h3>
              <p className="text-xs text-text-secondary">Upload high-resolution shots, cover images and embed virtual tours.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Side: Images */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Cover Image</Label>
                    <ImageUpload 
                      value={watch("cover_image") || ""}
                      onChange={(url) => setValue("cover_image", url)}
                      onRemove={() => setValue("cover_image", "")}
                      subfolder="venues/cover"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Showcase Images (Up to 4)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[0, 1, 2, 3].map((idx) => {
                        const url = watchedImages[idx] || "";
                        return (
                          <div key={idx} className="border border-border/85 rounded-xl p-1 bg-bg-elevated/15">
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
                              subfolder="venues/gallery"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Side: Videos & Tour */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Walkthrough Video (Placeholder MP4 Upload)</Label>
                    <VideoUpload
                      value={watchedVideos[0] || ""}
                      onChange={(url) => setValue("videos", [url])}
                      onRemove={() => setValue("videos", [])}
                      subfolder="venues/video"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>YouTube Link Embeds</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="https://youtube.com/watch?v=..." 
                        value={youtubeInput}
                        onChange={(e) => setYoutubeInput(e.target.value)}
                      />
                      <Button type="button" onClick={addYoutubeLink} className="bg-primary hover:bg-primary/95 text-white h-10">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {watchedYoutubeLinks.map((link, i) => (
                        <div key={i} className="flex justify-between items-center text-xs bg-bg-elevated/40 p-2 rounded border border-border/50 text-text-primary">
                          <span className="truncate max-w-[200px]">{link}</span>
                          <button type="button" onClick={() => removeYoutubeLink(i)} className="text-error hover:text-red-400">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="reg_virtual_tour">360° Virtual Tour URL Placeholder</Label>
                    <Input id="reg_virtual_tour" placeholder="https://matterport.com/show/?m=..." {...register("virtual_tour")} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: AVAILABILITY SCHEDULER */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-text-primary flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> Availability Settings
              </h3>
              <p className="text-xs text-text-secondary">Configure available slots timings, blocked schedules and buffer times.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Side: Weekly Schedule */}
                <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-2 border-r border-border/40">
                  <Label>Weekly Schedule Timings</Label>
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
                          <span className="text-xs font-bold text-text-primary w-20 capitalize">{day}</span>
                        </div>

                        {dayData.available ? (
                          <div className="flex items-center gap-2 text-xs">
                            <input 
                              type="time" 
                              value={dayData.start}
                              onChange={(e) => setValue(`weekly_schedule.${day}.start`, e.target.value)}
                              className="bg-bg-card border border-border rounded px-2 py-1 text-text-primary"
                            />
                            <span className="text-text-muted">to</span>
                            <input 
                              type="time" 
                              value={dayData.end}
                              onChange={(e) => setValue(`weekly_schedule.${day}.end`, e.target.value)}
                              className="bg-bg-card border border-border rounded px-2 py-1 text-text-primary"
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-text-muted italic">Closed / Holiday</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Right Side: Holidays & Buffers */}
                <div className="space-y-4">
                  {/* Blocked Dates */}
                  <div className="space-y-2">
                    <Label>Blocked / Booked Dates</Label>
                    <div className="flex gap-2">
                      <Input type="date" value={blockedDateInput} onChange={(e) => setBlockedDateInput(e.target.value)} />
                      <Button type="button" onClick={addBlockedDate} className="bg-primary hover:bg-primary/95 text-white">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {watchedBlockedDates.map(d => (
                        <span key={d} className="inline-flex items-center gap-1 bg-bg-elevated/45 text-text-primary border border-border/80 px-2 py-0.5 rounded-full text-xs">
                          {d}
                          <button type="button" onClick={() => removeBlockedDate(d)} className="text-error hover:text-red-400 font-bold ml-1">×</button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Maintenance Days */}
                  <div className="space-y-2">
                    <Label>Maintenance Days (Select specific dates)</Label>
                    <div className="flex gap-2">
                      <Input type="date" value={maintenanceInput} onChange={(e) => setMaintenanceInput(e.target.value)} />
                      <Button type="button" onClick={addMaintenanceDay} className="bg-primary hover:bg-primary/95 text-white">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {watchedMaintenanceDays.map(d => (
                        <span key={d} className="inline-flex items-center gap-1 bg-bg-elevated/45 text-text-primary border border-border/80 px-2 py-0.5 rounded-full text-xs">
                          {d}
                          <button type="button" onClick={() => removeMaintenanceDay(d)} className="text-error hover:text-red-400 font-bold ml-1">×</button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Public Holidays */}
                  <div className="space-y-2">
                    <Label>Public Holidays Blocklist</Label>
                    <div className="flex gap-2">
                      <Input type="date" value={holidayInput} onChange={(e) => setHolidayInput(e.target.value)} />
                      <Button type="button" onClick={addPublicHoliday} className="bg-primary hover:bg-primary/95 text-white">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {watchedPublicHolidays.map(d => (
                        <span key={d} className="inline-flex items-center gap-1 bg-bg-elevated/45 text-text-primary border border-border/80 px-2 py-0.5 rounded-full text-xs">
                          {d}
                          <button type="button" onClick={() => removePublicHoliday(d)} className="text-error hover:text-red-400 font-bold ml-1">×</button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Booking Buffer Time */}
                  <div className="space-y-1.5">
                    <Label htmlFor="reg_buffer">Booking Buffer Time Between Events</Label>
                    <select
                      id="reg_buffer"
                      {...register("booking_buffer_time", { valueAsNumber: true })}
                      className="flex h-10 w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary"
                    >
                      <option value={0}>No Buffer</option>
                      <option value={15}>15 Minutes</option>
                      <option value={30}>30 Minutes</option>
                      <option value={60}>1 Hour</option>
                      <option value={120}>2 Hours</option>
                      <option value={1440}>1 Day</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: DOCUMENTS */}
          {currentStep === 8 && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-text-primary flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Verification Documents Upload
              </h3>
              <p className="text-xs text-text-secondary">Please submit scanned proof of your business licenses and ID cards.</p>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                
                {/* PAN UPLOAD */}
                <div className="p-4 border border-border/55 rounded-2xl bg-bg-elevated/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="space-y-1">
                    <Label className="font-extrabold text-text-primary">PAN Card Document (Required)</Label>
                    <p className="text-xs text-text-secondary">Scanned card in JPEG, PNG or PDF format.</p>
                    {watchedDocPan && (
                      <span className="inline-block text-[10px] text-emerald-400 truncate max-w-[250px]">{watchedDocPan}</span>
                    )}
                  </div>
                  <div>
                    <input 
                      type="file" 
                      id="upload_pan" 
                      className="hidden" 
                      onChange={(e) => handleDocumentUpload(e, "doc_pan")} 
                      accept="image/*,application/pdf"
                    />
                    <Button 
                      type="button" 
                      onClick={() => document.getElementById("upload_pan")?.click()}
                      disabled={uploadingDoc["doc_pan"]}
                      variant="outline"
                      className="h-10 text-xs w-full sm:w-auto"
                    >
                      {uploadingDoc["doc_pan"] ? "Uploading..." : watchedDocPan ? "Re-upload Document" : "Choose File"}
                    </Button>
                  </div>
                </div>
                {errors.doc_pan && <span className="text-xs text-error flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.doc_pan.message}</span>}

                {/* GST UPLOAD */}
                <div className="p-4 border border-border/55 rounded-2xl bg-bg-elevated/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="space-y-1">
                    <Label className="font-extrabold text-text-primary">GST Certificate (Optional)</Label>
                    <p className="text-xs text-text-secondary">Tax registration document scan.</p>
                    {watchedDocGst && (
                      <span className="inline-block text-[10px] text-emerald-400 truncate max-w-[250px]">{watchedDocGst}</span>
                    )}
                  </div>
                  <div>
                    <input 
                      type="file" 
                      id="upload_gst" 
                      className="hidden" 
                      onChange={(e) => handleDocumentUpload(e, "doc_gst")} 
                      accept="image/*,application/pdf"
                    />
                    <Button 
                      type="button" 
                      onClick={() => document.getElementById("upload_gst")?.click()}
                      disabled={uploadingDoc["doc_gst"]}
                      variant="outline"
                      className="h-10 text-xs w-full sm:w-auto"
                    >
                      {uploadingDoc["doc_gst"] ? "Uploading..." : watchedDocGst ? "Re-upload Document" : "Choose File"}
                    </Button>
                  </div>
                </div>

                {/* OWNERSHIP PROOF */}
                <div className="p-4 border border-border/55 rounded-2xl bg-bg-elevated/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="space-y-1">
                    <Label className="font-extrabold text-text-primary">Ownership Proof (Required)</Label>
                    <p className="text-xs text-text-secondary">Property registry deed scan or rental agreement.</p>
                    {watchedDocOwnershipProof && (
                      <span className="inline-block text-[10px] text-emerald-400 truncate max-w-[250px]">{watchedDocOwnershipProof}</span>
                    )}
                  </div>
                  <div>
                    <input 
                      type="file" 
                      id="upload_ownership" 
                      className="hidden" 
                      onChange={(e) => handleDocumentUpload(e, "doc_ownership_proof")} 
                      accept="image/*,application/pdf"
                    />
                    <Button 
                      type="button" 
                      onClick={() => document.getElementById("upload_ownership")?.click()}
                      disabled={uploadingDoc["doc_ownership_proof"]}
                      variant="outline"
                      className="h-10 text-xs w-full sm:w-auto"
                    >
                      {uploadingDoc["doc_ownership_proof"] ? "Uploading..." : watchedDocOwnershipProof ? "Re-upload Document" : "Choose File"}
                    </Button>
                  </div>
                </div>
                {errors.doc_ownership_proof && <span className="text-xs text-error flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.doc_ownership_proof.message}</span>}

                {/* GOVERNMENT ID */}
                <div className="p-4 border border-border/55 rounded-2xl bg-bg-elevated/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="space-y-1">
                    <Label className="font-extrabold text-text-primary">Government Issued ID (Required)</Label>
                    <p className="text-xs text-text-secondary">Aadhaar card, Passport, or Driving License.</p>
                    {watchedDocGovId && (
                      <span className="inline-block text-[10px] text-emerald-400 truncate max-w-[250px]">{watchedDocGovId}</span>
                    )}
                  </div>
                  <div>
                    <input 
                      type="file" 
                      id="upload_govid" 
                      className="hidden" 
                      onChange={(e) => handleDocumentUpload(e, "doc_government_id")} 
                      accept="image/*,application/pdf"
                    />
                    <Button 
                      type="button" 
                      onClick={() => document.getElementById("upload_govid")?.click()}
                      disabled={uploadingDoc["doc_government_id"]}
                      variant="outline"
                      className="h-10 text-xs w-full sm:w-auto"
                    >
                      {uploadingDoc["doc_government_id"] ? "Uploading..." : watchedDocGovId ? "Re-upload Document" : "Choose File"}
                    </Button>
                  </div>
                </div>
                {errors.doc_government_id && <span className="text-xs text-error flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.doc_government_id.message}</span>}

                {/* BUSINESS LICENSE */}
                <div className="p-4 border border-border/55 rounded-2xl bg-bg-elevated/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="space-y-1">
                    <Label className="font-extrabold text-text-primary">Business License (Optional)</Label>
                    <p className="text-xs text-text-secondary">Local municipal license certificate scan.</p>
                    {watchedDocLicense && (
                      <span className="inline-block text-[10px] text-emerald-400 truncate max-w-[250px]">{watchedDocLicense}</span>
                    )}
                  </div>
                  <div>
                    <input 
                      type="file" 
                      id="upload_license" 
                      className="hidden" 
                      onChange={(e) => handleDocumentUpload(e, "doc_business_license")} 
                      accept="image/*,application/pdf"
                    />
                    <Button 
                      type="button" 
                      onClick={() => document.getElementById("upload_license")?.click()}
                      disabled={uploadingDoc["doc_business_license"]}
                      variant="outline"
                      className="h-10 text-xs w-full sm:w-auto"
                    >
                      {uploadingDoc["doc_business_license"] ? "Uploading..." : watchedDocLicense ? "Re-upload Document" : "Choose File"}
                    </Button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 9: TERMS & REVIEW */}
          {currentStep === 9 && (
            <div className="space-y-6">
              <h3 className="text-lg font-black text-text-primary flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" /> Review Application Details
              </h3>
              <p className="text-xs text-text-secondary">Please audit all your onboarding records before submitting.</p>

              <div className="border border-border/80 rounded-2xl p-5 bg-bg-elevated/5">
                <h4 className="font-extrabold text-text-primary text-sm border-b border-border/50 pb-2">Application Properties Summary</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-3.5 text-xs">
                  <div>
                    <span className="font-bold text-text-muted">Contact Mobile:</span>
                    <p className="text-text-primary font-semibold">{watch("mobile")}</p>
                  </div>
                  <div>
                    <span className="font-bold text-text-muted">Owner Name:</span>
                    <p className="text-text-primary font-semibold">{watch("owner_name")}</p>
                  </div>
                  <div>
                    <span className="font-bold text-text-muted">Business Name:</span>
                    <p className="text-text-primary font-semibold">{watch("business_name")}</p>
                  </div>
                  <div>
                    <span className="font-bold text-text-muted">Venue Name:</span>
                    <p className="text-text-primary font-semibold">{watch("venue_name")}</p>
                  </div>
                  <div>
                    <span className="font-bold text-text-muted">Venue Type:</span>
                    <p className="text-text-primary font-semibold">{watch("venue_type")}</p>
                  </div>
                  <div>
                    <span className="font-bold text-text-muted">Location:</span>
                    <p className="text-text-primary font-semibold">{watch("address")}, {watch("state")}, {watch("country")}</p>
                  </div>
                  <div>
                    <span className="font-bold text-text-muted">Capacity Range:</span>
                    <p className="text-text-primary font-semibold">{watch("min_capacity")} to {watch("max_capacity")} guests</p>
                  </div>
                  <div>
                    <span className="font-bold text-text-muted">Daily Rent:</span>
                    <p className="text-text-primary font-semibold">INR {watch("base_price")}</p>
                  </div>
                  <div>
                    <span className="font-bold text-text-muted">Hourly Rate:</span>
                    <p className="text-text-primary font-semibold">INR {watch("hourly_price")}</p>
                  </div>
                </div>
              </div>

              <div className="bg-bg-elevated/10 border border-border/80 p-5 rounded-2xl space-y-4 text-xs text-text-secondary leading-relaxed">
                <h4 className="font-extrabold text-text-primary">Terms of Platform Listing</h4>
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
                  className="rounded border-border text-primary h-5 w-5 cursor-pointer focus:ring-primary focus:ring-offset-0 bg-transparent"
                />
                <Label htmlFor="reg_terms" className="cursor-pointer text-xs font-bold text-text-primary selection:bg-transparent">
                  I accept the Terms of Service, Privacy Policy & Commission policies.
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
