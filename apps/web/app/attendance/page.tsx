"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Upload, Camera, Users, Clock, Eye, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { attendanceEventCounter } from "@/lib/prometheus";
import toast from "react-hot-toast";
import { AppNavigation } from "@/components/AppNavigation";

interface AttendanceRecord {
  id: string;
  personName: string;
  confidence: number;
  faceId: number;
  bbox: number[];
  createdAt: string;
}

interface AttendanceResult {
  success: boolean;
  attendanceId: string;
  totalFaces: number;
  recognizedFaces: number;
  unknownFaces: number;
  attendanceRecords: AttendanceRecord[];
  rawResults?: any[];
}

interface DetectedFace {
  faceId: number;
  bbox: number[];
  confidence: number;
  landmarks?: number[][];
  faceCrop?: string;
}

export default function AttendancePage() {
  const { data: session } = useSession();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [result, setResult] = useState<AttendanceResult | null>(null);
  const [detectedFaces, setDetectedFaces] = useState<DetectedFace[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<"attendance" | "detection">("attendance");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setResult(null);
      setDetectedFaces([]);
    }
  };

  const handleDetectFaces = async () => {
    if (!selectedFile || !session) {
      toast.error("Please select an image and sign in");
      return;
    }

    setIsDetecting(true);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("/api/faces/detect", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to detect faces");
      }

      const data = await response.json();
      setDetectedFaces(data.faces);

      toast.success(`Detected ${data.facesDetected} faces!`);
    } catch (error) {
      console.error("Detection error:", error);
      toast.error("Failed to detect faces");
    } finally {
      setIsDetecting(false);
    }
  };

  const handleProcessAttendance = async () => {
    if (!selectedFile || !session) {
      toast.error("Please select an image and sign in");
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("/api/attendance", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process attendance");
      }

      const data = await response.json();
      setResult(data);

      attendanceEventCounter.inc({
        event_type: "image_uploaded",
        user_id: session.user?.id || "unknown",
      });

      toast.success(`Processed ${data.recognizedFaces} faces successfully!`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to process attendance");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!session) {
    return (
      <>
        <AppNavigation />
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                Please sign in to access attendance tracking
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <AppNavigation />
      <div className="min-h-screen bg-black p-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Face Recognition System
              </h1>
              <p className="text-sm sm:text-base text-gray-400">
                Upload a group photo to detect faces or track attendance using
                RetinaFace and ArcFace technology
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="lg:col-span-1"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Upload Image
                    </CardTitle>
                    <CardDescription>
                      Select a photo for face detection or attendance processing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-4 sm:p-8 text-center">
                      {previewUrl ? (
                        <div className="space-y-3 sm:space-y-4">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-w-full max-h-32 sm:max-h-48 mx-auto rounded-lg"
                          />
                          <p className="text-xs sm:text-sm text-gray-400 break-all">
                            {selectedFile?.name}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 sm:space-y-4">
                          <Camera className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-gray-400" />
                          <div>
                            <p className="text-base sm:text-lg font-medium">
                              Upload a photo
                            </p>
                            <p className="text-xs sm:text-sm text-gray-400">
                              Drag and drop or click to select
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="w-full text-xs sm:text-sm text-gray-400 file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-white file:text-black hover:file:bg-gray-200"
                    />

                    <div className="space-y-2">
                      <Button
                        onClick={handleDetectFaces}
                        disabled={!selectedFile || isDetecting}
                        className="w-full"
                        variant="outline"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {isDetecting ? "Detecting..." : "Detect Faces Only"}
                      </Button>

                      <Button
                        onClick={handleProcessAttendance}
                        disabled={!selectedFile || isProcessing}
                        className="w-full"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        {isProcessing ? "Processing..." : "Process Attendance"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:col-span-2"
              >
                {detectedFaces.length > 0 && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Detected Faces ({detectedFaces.length})
                      </CardTitle>
                      <CardDescription>
                        RetinaFace detection results with face crops
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                        {detectedFaces.map((face) => (
                          <div key={face.faceId} className="text-center">
                            {face.faceCrop && (
                              <img
                                src={`data:image/jpeg;base64,${face.faceCrop}`}
                                alt={`Face ${face.faceId}`}
                                className="w-full aspect-square object-cover rounded-lg mb-2"
                              />
                            )}
                            <div className="text-xs sm:text-sm">
                              <div className="font-medium">
                                Face {face.faceId}
                              </div>
                              <div className="text-gray-400">
                                {(face.confidence * 100).toFixed(1)}% conf.
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Attendance Results
                    </CardTitle>
                    <CardDescription>
                      ArcFace recognition and attendance tracking results
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {result ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                          <div className="text-center p-3 sm:p-4 bg-gray-800 rounded-lg">
                            <div className="text-xl sm:text-2xl font-bold text-white">
                              {result.totalFaces}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-400">
                              Total Faces
                            </div>
                          </div>
                          <div className="text-center p-3 sm:p-4 bg-gray-800 rounded-lg">
                            <div className="text-xl sm:text-2xl font-bold text-green-400">
                              {result.recognizedFaces}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-400">
                              Recognized
                            </div>
                          </div>
                          <div className="text-center p-3 sm:p-4 bg-gray-800 rounded-lg">
                            <div className="text-xl sm:text-2xl font-bold text-orange-400">
                              {result.unknownFaces}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-400">
                              Unknown
                            </div>
                          </div>
                        </div>
                        {result.unknownFaces > 0 && (
                          <div className="flex items-center gap-2 p-3 bg-orange-900 rounded-lg">
                            <AlertTriangle className="h-4 w-4 text-orange-400" />
                            <span className="text-sm text-orange-200">
                              {result.unknownFaces} face(s) were not recognized.
                              Consider adding them to the dataset.
                            </span>
                          </div>
                        )}

                        {result.attendanceRecords.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3">
                              Attendance Records
                            </h4>
                            <div className="space-y-3">
                              {result.attendanceRecords.map((record) => (
                                <div
                                  key={record.id}
                                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-800 rounded-lg gap-3 sm:gap-0"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center text-black text-xs sm:text-sm font-medium">
                                      {record.faceId}
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium text-sm sm:text-base">
                                        {record.personName}
                                      </div>
                                      <div className="text-xs sm:text-sm text-gray-400">
                                        Confidence:{" "}
                                        {(record.confidence * 100).toFixed(1)}%
                                        {record.bbox && (
                                          <span className="ml-1 sm:ml-2 hidden sm:inline">
                                            • Bbox: [{record.bbox.join(", ")}]
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-400 ml-10 sm:ml-0">
                                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                                    {new Date(
                                      record.createdAt
                                    ).toLocaleTimeString()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Upload an image to see attendance results</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
