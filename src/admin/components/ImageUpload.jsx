
import { useEffect, useState } from "react";
import { getImageUrl } from "../../services/api";

function ImageUpload({
    image,
    setImage,
    existingImage = null,
    label = "Image",
    folder = "products"
}) {

    const [preview, setPreview] =
        useState(null);


    useEffect(() => {

        if (!image) {

            setPreview(null);

            return;

        }


        const objectUrl =
            URL.createObjectURL(image);

        setPreview(objectUrl);


        return () => {

            URL.revokeObjectURL(
                objectUrl
            );

        };

    }, [image]);


    const handleChange = (e) => {

        const file =
            e.target.files[0];


        if (!file) return;


        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
        ];


        if (!allowedTypes.includes(file.type)) {

            alert(
                "Please select a JPG, PNG, WEBP or GIF image."
            );

            return;

        }


        if (file.size > 5 * 1024 * 1024) {

            alert(
                "Image must be less than 5MB."
            );

            return;

        }


        setImage(file);

    };


    return (

        <div className="form-group">

            <label>
                {label}
            </label>


            <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleChange}
            />


            {preview && (

                <div className="image-preview">

                    <p>
                        New Image:
                    </p>

                    <img
                        src={preview}
                        alt="Preview"
                        style={{
                            width: "150px",
                            height: "150px",
                            objectFit: "cover",
                            borderRadius: "8px"
                        }}
                    />

                </div>

            )}


            {!preview &&
                existingImage && (

                    <div className="image-preview">

                        <p>
                            Current Image:
                        </p>

                        <img
                            src={getImageUrl(folder, existingImage)}
                            alt="Current"
                            style={{
                                width: "150px",
                                height: "150px",
                                objectFit: "cover",
                                borderRadius: "8px"
                            }}
                        />

                    </div>

                )}


            {image && (

                <p>
                    Selected: {image.name}
                </p>

            )}

        </div>

    );

}

export default ImageUpload;
