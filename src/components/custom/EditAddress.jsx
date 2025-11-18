import { Button, Dialog, Field, Input, NativeSelect, Portal } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { supabase } from "@/helper/supabase";

export default function EditAddress({ useremail }) {
  const [address, setAddress] = useState({
    address_line: '',
    barangay: '',
    city: '',
    province: 'Metro Manila'
  })
  const selectedProvince = "Metro Manila";
  const [cities, setCities] = useState([])
  const [selectedCity, setSelectedCity] = useState({
    code: "137501000",
    name: "",
  })
  const [barangays, setBarangays] = useState([])
  const [selectBarangay, setSelectedBarangay] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchCities = async () => {
      const cities = await axios.get(`https://psgc.gitlab.io/api/regions/130000000/cities/`)
      const sorted = cities.data.sort((a, b) => a.name.localeCompare(b.name));
      setCities(sorted);
      setSelectedCity({
        code: sorted[0].code,
        name: sorted[0].name,
      })
      setAddress((prev) => ({
        ...prev,
        city: sorted[0].name
      }));
    }

    fetchCities();
  }, [])

  useEffect(() => {
    const fetchBarangays = async () => {
      const barangays = await axios.get(`https://psgc.gitlab.io/api/cities/${selectedCity.code}/barangays/`)
      const sorted = barangays.data.sort((a, b) => a.name.localeCompare(b.name));
      setBarangays(sorted)
      setSelectedBarangay(sorted[0].name)
      setAddress((prev) => ({
        ...prev,
        barangay: sorted[0].name
      }));
    }
    fetchBarangays();
  }, [selectedCity])

  const handleSaveAddress = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ shipping_address: address })
        .eq('email', useremail)
        .select();

      if (error) throw error;

      // success alert
      alert('Address saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Something went wrong while saving the address.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="outline">
          Edit Address
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Edit Address</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Field.Root>
                <Field.Root>
                  <Field.Label>Province</Field.Label>
                  <Input readOnly value={selectedProvince} />
                </Field.Root>
                <Field.Root>
                  <Field.Label>City</Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field value={selectedCity?.code || ""} onChange={(e) => {
                      const code = e.target.value;
                      const city = cities.find((p) => p.code === code);
                      setSelectedCity(city || null);
                    }}>
                      {cities.map((city) => (
                        <option key={city.code} value={city.code}>{city.name}</option>
                      ))}
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                </Field.Root>
                <Field.Root>
                  <Field.Label>Barangay</Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field value={selectBarangay} onChange={(e) => setSelectedBarangay(e.currentTarget.value)}>
                      {barangays.map((barangay) => (
                        <option key={barangay.code} value={barangay.name}>{barangay.name}</option>
                      ))}
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                </Field.Root>
                <Field.Root>
                  <Field.Label>Street/Building/Unit/Room</Field.Label>
                  <Input value={address.address_line} onChange={(e) => setAddress((prev) => ({
                    ...prev,
                    address_line: e.target.value
                  }))} />
                </Field.Root>
              </Field.Root>
            </Dialog.Body>
            <Dialog.Footer>
              <Button loading={loading} disabled={address.address_line === ""} onClick={handleSaveAddress} rounded="full" bg="blue.600">Save Address</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}