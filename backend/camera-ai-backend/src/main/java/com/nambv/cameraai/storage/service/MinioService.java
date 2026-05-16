package com.nambv.cameraai.storage.service;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MinioService {

    private final MinioClient minioClient;

    @Value("${minio.bucket}")
    private String bucketName;

    @Value("${minio.public-url}")
    private String publicUrl;

    public String uploadAlertImage(MultipartFile file, String macAddress) {
        try {
            ensureBucketExists();

            String objectName = buildObjectName(file, macAddress);

            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );

            return publicUrl + "/" + bucketName + "/" + objectName;

        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file to MinIO: " + e.getMessage());
        }
    }

    private void ensureBucketExists() throws Exception {
        boolean found = minioClient.bucketExists(
                BucketExistsArgs.builder()
                        .bucket(bucketName)
                        .build()
        );

        if (!found) {
            minioClient.makeBucket(
                    MakeBucketArgs.builder()
                            .bucket(bucketName)
                            .build()
            );
        }
    }

    private String buildObjectName(MultipartFile file, String macAddress) {
        LocalDate now = LocalDate.now();

        String safeMac = macAddress
                .replace(":", "-")
                .replace(" ", "")
                .toUpperCase();

        String originalFilename = file.getOriginalFilename();
        String extension = getExtension(originalFilename);

        return "alerts/"
                + safeMac + "/"
                + now.getYear() + "/"
                + String.format("%02d", now.getMonthValue()) + "/"
                + String.format("%02d", now.getDayOfMonth()) + "/"
                + UUID.randomUUID()
                + extension;
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return ".jpg";
        }

        return filename.substring(filename.lastIndexOf("."));
    }
}