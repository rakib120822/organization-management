import { cloudinary } from "../../lib/cloudinary";
import { AppError } from "../../utils/app-error";
import { prisma } from "../../lib/prisma";

const uploadToCloudinary = (
  buffer: Buffer,
): Promise<{
  secure_url: string;
  public_id: string;
}> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "profile-images",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(
            new AppError(
              error.http_code || 500,
              error.message || "Image upload failed",
            ),
          );
        }

        if (!result) {
          return reject(new AppError(500, "Cloudinary upload failed"));
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      },
    );

    uploadStream.end(buffer);
  });
};

const uploadProfileImage = async (buffer: Buffer, email: string) => {
  // 1. Find current user
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      avatarUrl: true,
      avatarPublicId: true,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  // 2. Upload new image
  const newImage = await uploadToCloudinary(buffer);

  try {
    // 3. Update database
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        avatarUrl: newImage.secure_url,
        avatarPublicId: newImage.public_id,
      },
    });

    // 4. Delete old image
    if (user.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId);
    }

    return updatedUser;
  } catch (error) {
    // If DB update fails, delete the newly uploaded image
    // so you don't leave an unused file in Cloudinary.
    await cloudinary.uploader.destroy(newImage.public_id);

    throw error;
  }
};

const userService = {
  uploadProfileImage,
};

export default userService;
