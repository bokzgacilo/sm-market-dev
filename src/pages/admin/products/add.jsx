import { Button, Card, Checkbox, Field, FileUpload, Image, Input, NativeSelect, NumberInput, SimpleGrid, Stack, Text, Textarea } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LuUpload } from "react-icons/lu";
import ProductViewer from "@/components/custom/ProductViewer";
import { supabase } from "@/helper/supabase";

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove special characters
    .replace(/\s+/g, "-")         // replace spaces with dashes
    .replace(/-+/g, "-");         // collapse multiple dashes
}

export default function AddProduct() {
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [images, setImages] = useState([])
  const [url, setUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: "",
    brand: "",
    price: 100,
    compare_at_price: 75,
    isSale: false,
    sale_price: 50,
    category: "",
    subcategory: "",
    "3d_model": "",
    images: [],
    slug: "",
    description: ""
  })

  useEffect(() => {
    const getAllCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('name,slug,subcategories')

      if (data) {
        setCategories(data)
        setSubcategories(Object.values(data)[0].subcategories);
        setForm({
          ...form,
          category: data[0].slug,
          subcategory: Object.values(data)[0].subcategories[0],
        });
      }
    }

    getAllCategories()
  }, [])

  useEffect(() => {
    const selected = categories.find(item => item.slug === form.category);
    setSubcategories(selected ? selected.subcategories : []);
    setForm({ ...form, subcategory: subcategories[0] })
  }, [form.category])

  const handleAddProduct = async () => {
    setLoading(true)
    try {
      const uploadedUrls = [];
      const folder = slugify(form.title)

      // loop upload images
      for (const [index, imageUrl] of images.entries()) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const ext = blob.type.split("/")[1];
        const fileName = `${slugify(form.title)}-${index + 1}.${ext}`; // you can detect type if needed
        const filePath = `${folder}/${fileName}`;

        const { error } = await supabase.storage
          .from("product-images")
          .upload(filePath, blob, {
            cacheControl: "3600",
            upsert: true,
            contentType: blob.type,
          });

        if (error) {
          console.error("Upload error:", error);
          return null;
        }

        const { data: publicData } = await supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        uploadedUrls.push(publicData.publicUrl);
        console.log(publicData)
      }

      setForm((prev) => ({
        ...prev,
        images: uploadedUrls
      }));


      const response = await fetch(url);
      const blob = await response.blob();
      const glbBlob = new Blob([blob], { type: "model/gltf-binary" });
      const fileName = `${slugify(form.title)}.glb`; // you can detect type if needed

      const { error } = await supabase.storage
        .from("3d-models")
        .upload(fileName, glbBlob, {
          cacheControl: "3600",
          upsert: true,
          contentType: "model/gltf-binary",
        });

      if (error) {
        console.error("Upload error:", error);
        return null;
      }

      const { data: publicData } = await supabase.storage
        .from("3d-models")
        .getPublicUrl(fileName);

      console.log(publicData)


      setForm({ ...form, "3d_model": publicData.publicUrl });

      const updatedForm = {
          ...form,
          images: uploadedUrls,
          "3d_model": publicData.publicUrl
        };

      const { data, error: insertError } = await supabase
        .from("products")
        .insert([updatedForm])
        .select(); // optional: returns inserted row

      if (insertError) {
        console.error("Insert error:", insertError);
        return;
      }

      console.log("✅ Product added successfully:", data);
      alert("Product added successfully!");
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack p={4}>
      <Card.Root>
        <Card.Header p={4}>
          <Card.Title>
            Add Product
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <SimpleGrid columns={3} gap={4}>
            <Stack gap={4}>
              <Field.Root>
                <Field.Label>Product Name</Field.Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value, slug: slugify(e.target.value) })}
                />
              </Field.Root>
              <Field.Root>
                <Field.Label>Brand</Field.Label>
                <Input
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                />
              </Field.Root>
              <SimpleGrid columns={2} gap={4}>
                <Field.Root>
                  <Field.Label>Price</Field.Label>
                  <NumberInput.Root
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    min={10}
                  >
                    <NumberInput.Control />
                    <NumberInput.Input />
                  </NumberInput.Root>
                </Field.Root>
                <Field.Root>
                  <Field.Label>Compare At Price</Field.Label>
                  <NumberInput.Root
                    value={form.compare_at_price}
                    onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })}
                    min={10}
                  >
                    <NumberInput.Control />
                    <NumberInput.Input />
                  </NumberInput.Root>
                </Field.Root>
              </SimpleGrid>
              <Field.Root>
                <Field.Label>Category</Field.Label>
                <NativeSelect.Root
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <NativeSelect.Field>
                    {categories.map((category) =>
                      <option key={category.slug} value={category.slug}>{category.name}</option>
                    )}
                  </NativeSelect.Field>
                </NativeSelect.Root>
              </Field.Root>
              <Field.Root>
                <Field.Label>Sub-Category</Field.Label>
                <NativeSelect.Root
                  disabled

                  value={form.subcategory}
                  onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                >
                  <NativeSelect.Field>
                    {subcategories.map((subcategory) =>
                      <option key={subcategory} value={subcategory}>{subcategory}</option>
                    )}
                  </NativeSelect.Field>
                </NativeSelect.Root>
              </Field.Root>
              <Field.Root>
                <Field.Label>Is On Sale?</Field.Label>
                <Checkbox.Root
                  value={form.isSale}
                  onCheckedChange={(e) => setForm({ ...form, isSale: !!e.checked })}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                </Checkbox.Root>
              </Field.Root>
              {form.isSale &&
                <Field.Root>
                  <Field.Label>Sale Price</Field.Label>
                  <NumberInput.Root
                    value={form.sale_price}
                    onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
                    defaultValue="10"
                    min={5}
                  >
                    <NumberInput.Control />
                    <NumberInput.Input />
                  </NumberInput.Root>
                </Field.Root>
              }
              <Field.Root>
                <Field.Label>Description</Field.Label>
                <Textarea row={10} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </Field.Root>
            </Stack>
            <Stack>
              <Field.Root>
                <Field.Label>3D Model</Field.Label>
                <FileUpload.Root
                  accept={["model/gltf-binary", ".glb"]}
                  maxFiles={1}
                  onFileAccept={async (e) => {
                    const file = e.files[0];
                    if (!file) return;
                    setUrl(URL.createObjectURL(file))
                  }}
                >
                  <FileUpload.HiddenInput />
                  <FileUpload.Trigger asChild>
                    <Button variant="outline">
                      <LuUpload /> Upload 3D Model
                    </Button>
                  </FileUpload.Trigger>
                  <FileUpload.List />
                </FileUpload.Root>
              </Field.Root>
              {url && <ProductViewer modelUrl={url} />}
            </Stack>
            <Stack>

              <Field.Root>
                <Field.Label>Images</Field.Label>
                {images.length === 0 &&
                  <FileUpload.Root
                    accept={["image/*"]}
                    maxFiles={4}
                    onFileChange={(e) => {
                      console.log("Files changed");
                      // Always clear previous images
                      console.log("Changed files:", e.files || e.acceptedFiles);
                      const urls = e.acceptedFiles.map((file) => URL.createObjectURL(file));
                      setImages(urls);
                    }}
                    onFileAccept={(e) => {
                      console.log('clear images')
                    }}
                  >
                    <FileUpload.HiddenInput />
                    <FileUpload.Trigger asChild>
                      <Button variant="outline">
                        <LuUpload /> Upload Product Images
                      </Button>
                    </FileUpload.Trigger>
                  </FileUpload.Root>
                }
                {images.length !== 0 ?
                  <Stack>
                    <Button onClick={() => setImages([])}>Clear</Button>
                    <SimpleGrid columns={2} gap={4}>
                      {images.map((image, index) => <Image rounded="sm" src={image} key={index} objectFit="cover" height="250px" />)}
                    </SimpleGrid>
                  </Stack>
                  : <Text>No image selected</Text>}
              </Field.Root>

            </Stack>
          </SimpleGrid>
        </Card.Body>
        <Card.Footer>
          <Button
            onClick={handleAddProduct}
            rounded="full"
            bg="blue.600"
            loading={loading}
          >Add Product</Button>
        </Card.Footer>
      </Card.Root>
    </Stack>
  )
}