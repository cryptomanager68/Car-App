import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Heart, Clock, Settings, Star, Calendar, MapPin, Edit } from "lucide-react";
import { Car } from "@/data/cars";
import { bookingService } from "@/services/bookingService";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface UserPanelProps {
  favorites: Car[];
  onRemoveFavorite: (carId: string) => void;
}

export function UserPanel({ favorites, onRemoveFavorite }: UserPanelProps) {
  const [bookings, setBookings] = useState(bookingService.getAllBookings());
  const { toast } = useToast();
  
  const [userName, setUserName] = useState("Guest");
  const [userEmail, setUserEmail] = useState("guest@example.com");
  const [userInitial, setUserInitial] = useState("G");

  // Dialog states
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [avatarSettingsOpen, setAvatarSettingsOpen] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({ name: userName, email: userEmail });
  const [avatarImage, setAvatarImage] = useState<string | null>(
    localStorage.getItem('userAvatarImage')
  );
  const [avatarColor, setAvatarColor] = useState(
    localStorage.getItem('userAvatarColor') || '#2563eb'
  );

  const avatarColors = [
    { name: 'Blue', value: '#2563eb' },
    { name: 'Purple', value: '#9333ea' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Indigo', value: '#6366f1' },
  ];

  useEffect(() => {
    setBookings(bookingService.getAllBookings());
  }, []);

  const handleSaveProfile = () => {
    setUserName(profileForm.name);
    setUserEmail(profileForm.email);
    setUserInitial(profileForm.name.charAt(0).toUpperCase());
    setEditProfileOpen(false);
    toast({ title: "Profile Updated", description: "Your profile has been updated successfully." });
  };

  const handleSaveAvatar = (color: string) => {
    setAvatarColor(color);
    localStorage.setItem('userAvatarColor', color);
    setAvatarSettingsOpen(false);
    toast({ title: "Avatar Updated", description: "Your avatar color has been changed." });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "Error", description: "Image size must be less than 2MB", variant: "destructive" });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatarImage(base64String);
        localStorage.setItem('userAvatarImage', base64String);
        toast({ title: "Avatar Updated", description: "Your profile picture has been uploaded." });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setAvatarImage(null);
    localStorage.removeItem('userAvatarImage');
    toast({ title: "Avatar Removed", description: "Your profile picture has been removed." });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <User className="h-5 w-5" />
          {favorites.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {favorites.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[380px] sm:w-[420px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display">My Account</SheetTitle>
          <SheetDescription>Manage your favorites and preferences</SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="favorites" className="mt-6">
          <TabsList className="w-full">
            <TabsTrigger value="favorites" className="flex-1 gap-1">
              <Heart className="h-3.5 w-3.5" /> Favorites
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1 gap-1">
              <Clock className="h-3.5 w-3.5" /> History
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-1 gap-1">
              <Settings className="h-3.5 w-3.5" /> Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="favorites" className="mt-4 space-y-3">
            {favorites.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No favorites yet. Click the heart icon on any car to save it!</p>
            ) : (
              favorites.map((car) => (
                <div key={car.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                  <img src={car.image} alt={car.name} className="w-20 h-14 object-cover rounded-md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-card-foreground truncate">{car.name}</p>
                    <p className="text-xs text-muted-foreground">{car.year} · ${car.price.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      <span className="text-xs text-muted-foreground">{car.rating}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveFavorite(car.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors self-start"
                  >
                    <Heart className="h-4 w-4 fill-current text-destructive" />
                  </button>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            {bookings.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <Clock className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No rental history yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div key={booking.id} className="p-3 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex gap-3">
                      <img src={booking.car.image} alt={booking.car.name} className="w-20 h-14 object-cover rounded-md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-card-foreground truncate">{booking.car.name}</p>
                        <p className="text-xs text-muted-foreground">{booking.car.year}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            booking.status === 'confirmed' ? 'bg-success/10 text-success' :
                            booking.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                            'bg-warning/10 text-warning'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(booking.rental.pickupDate), "MMM dd")} - {format(new Date(booking.rental.returnDate), "MMM dd, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="capitalize">{booking.rental.pickupLocation}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="font-medium text-card-foreground">${booking.payment.grandTotal.toLocaleString()}</span>
                        <span className="text-xs">ID: {booking.id}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="mt-4 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                {avatarImage ? (
                  <img 
                    src={avatarImage} 
                    alt="User avatar" 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: avatarColor }}
                  >
                    {userInitial}
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm text-card-foreground">{userName}</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-card-foreground">Profile</h4>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    setProfileForm({ name: userName, email: userEmail });
                    setEditProfileOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => setAvatarSettingsOpen(true)}
                >
                  <User className="h-4 w-4" />
                  Avatar Settings
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Profile Dialog */}
        <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>Update your personal information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="Enter your email"
                />
                <p className="text-xs text-muted-foreground">Booking confirmations will be sent to this email</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditProfileOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Avatar Settings Dialog */}
        <Dialog open={avatarSettingsOpen} onOpenChange={setAvatarSettingsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Avatar Settings</DialogTitle>
              <DialogDescription>Upload a photo or choose a color</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-6">
              {/* Current Avatar Preview */}
              <div className="flex justify-center">
                {avatarImage ? (
                  <img 
                    src={avatarImage} 
                    alt="User avatar" 
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-3xl"
                    style={{ backgroundColor: avatarColor }}
                  >
                    {userInitial}
                  </div>
                )}
              </div>

              {/* Upload Image Section */}
              <div className="space-y-3">
                <Label>Upload Photo</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    Choose File
                  </Button>
                  {avatarImage && (
                    <Button
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={handleRemoveImage}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: Square image, max 2MB (JPG, PNG, GIF)
                </p>
              </div>

              {/* Color Selection */}
              {!avatarImage && (
                <div className="space-y-3">
                  <Label>Or Choose a Color</Label>
                  <div className="grid grid-cols-4 gap-3">
                    {avatarColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => handleSaveAvatar(color.value)}
                        className={`w-full aspect-square rounded-lg transition-all hover:scale-110 ${
                          avatarColor === color.value ? 'ring-2 ring-offset-2 ring-primary' : ''
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setAvatarSettingsOpen(false)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
}
